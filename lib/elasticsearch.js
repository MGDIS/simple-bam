var assert = require('assert');
var events = require('events');
var util = require("util");
var path = require('path');
var fs = require('fs');
var request = require('request');
var async = require('async');
var _ = require('lodash');
_.mixin(require("lodash-deep"));
require('simple-errors');

var esIndexTemplate = require('../resources/es-index-template');
var esAlias = require('../resources/es-alias.json');
var tenantAliasStr = fs.readFileSync(path.join(__dirname, '../resources/es-tenant-alias.json'), 'utf-8');


/**
 * Create a template of index that will be applied to all day specific indexes. Return a function for easy integration with async.
 */
var createIndexTemplate = function(url) {
	return function(callback) {
		request({
			uri: url + '/_template/businessevents',
			method: 'PUT',
			json: esIndexTemplate
		}, function(err, response) {
			if (err) return callback(Error.create('Failed to create index template into elasticsearch', null, err));
			if (response.statusCode !== 200) return callback(Error.http(response.statusCode, 'Failed to create index template into elasticsearch', response.toJSON()));
			callback(null);
		});
	};
};

/**
 * Create an empty index for today. Required to be able to create the alias.
 */
var createEmptyIndex = function(url) {
	return function(callback) {
		request({
			uri: url + '/' + getIndexName(),
			method: 'PUT'
		}, function(err, response) {
			if (err) return callback(Error.create('Failed to create empty index into elasticsearch', null, err));
			if (!_.contains([200, 400], response.statusCode)) return callback(Error.http(response.statusCode, 'Failed to create empty index into elasticsearch', response.toJSON()));
			callback(null);
		});
	};
};

/**
 * Create an alias for all day specific indexes. Return a function for easy integration with async.
 */
var createAlias = function(url) {
	return function(callback) {
		request({
			uri: url + '/_aliases',
			method: 'POST',
			json: esAlias
		}, function(err, response) {
			if (err) return callback(Error.create('Failed to create alias into elasticsearch', null, err));
			if (response.statusCode !== 200) return callback(Error.http(response.statusCode, 'Failed to create alias into elasticsearch', response.toJSON()));
			callback(null);
		});
	};
};

/**
 * Configure the elasticsearch cluster for indexing and search of business events.
 *
 * @param {object} url - Base URL of the elasticsearch cluster
 * @param {function} callback
 */
exports.configure = function(url, callback) {
	async.series([createIndexTemplate(url), createEmptyIndex(url), createAlias(url)], callback);
};

var tenantIdRegexp = /TENANTID/g;
/**
 * Create a filtered alias for a tenant
 */
exports.createTenantAlias = function(url, tenantId, callback) {
	var currentTenantAlias = tenantAliasStr.replace(tenantIdRegexp, tenantId);

	request({
		uri: url + '/_aliases',
		method: 'POST',
		body: currentTenantAlias
	}, function(err, response) {
		if (err) return callback(err);
		if (response.statusCode !== 200) return callback(Error.http(response.statusCode, 'Failed to create tenant alias into elasticsearch', response.toJSON()));
		callback(null);
	});
};

/**
 * Return an index name specific to today's date
 */
var getIndexName = function() {
	var date = new Date();
	return 'businessevents-' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay();
};

/**
 * Index an event into elasticsearch.
 *
 * @param {object} url - Base URL of the elasticsearch cluster
 * @param {object} event
 * @param {function} callback
 */
exports.index = function(url, businessEvent, callback) {
	var eventCopy = _.clone(businessEvent);

	var requestOptions = {
		uri: url + '/' + getIndexName() + '/businessEvent',
		method: 'POST',
		json: eventCopy
	};

	if (businessEvent.id) {
		requestOptions.uri += '/' + businessEvent.id;
		requestOptions.method = 'PUT';
	}

	// POST or PUT the event in an index specific to the current date
	request(requestOptions, function(err, response) {
		if (err) return callback(err);
		if (response.statusCode !== 201 && response.statusCode !== 200) {
			return callback(Error.http(response.statusCode, 'Failed to index event into elasticsearch', response.toJSON()));
		}
		eventCopy.id = response.body._id;
		callback(null, eventCopy);
	});
};

/**
 * Build a bulk indexer object.
 *
 * @constructor BulkIndexer
 * @param {string} url - Base URL of the elasticsearch cluster
 * @param {number} bufferLength
 * @param {number} maxDelay
 */
var BulkIndexer = function(url, maxBufferLength, maxDelay) {
	this.url = url;
	this.maxBufferLength = maxBufferLength || 1000;
	this.maxDelay = maxDelay || 1000;
	this.bufferBody = "";
	this.bufferLength = 0;

	events.EventEmitter.call(this);
};
util.inherits(BulkIndexer, events.EventEmitter);

/**
 * Either trigger the flush if buffer size is to its max
 * or create a timeout to the delay if not timeout is already present
 */
BulkIndexer.prototype.manageTimeout = function() {
	var that = this;

	if (that.bufferLength >= that.maxBufferLength) {
		that.flush();
	} else if (that.timeout === undefined) {
		that.timeout = setTimeout(function() {
			that.flush();
		}, that.maxDelay);
	}
};

/**
 * Actually send the business events to be indexed. Either triggers an 'error' or a 'flush' event.
 */
BulkIndexer.prototype.flush = function() {
	var that = this;

	var length = that.bufferLength;

	request({
		uri: that.url + '/_bulk',
		method: 'PUT',
		body: that.bufferBody
	}, function(err, response) {
		if (err) return that.emit('error', err);
		if (response.statusCode !== 200) {
			return that.emit('error', Error.http(response.statusCode, 'Failed to use elasticsearch bulk API', response.toJSON()));
		}
		that.emit('flush', length);
	});

	that.bufferBody = "";
	that.bufferLength = 0;

	clearTimeout(that.timeout);
	that.timeout = undefined;
};

/**
 * Append an index command to the buffer.
 */
BulkIndexer.prototype.index = function(businessEvent) {
	assert(businessEvent.id, 'For bulk indexing you should set an id.');

	this.bufferBody += JSON.stringify({
		index: {
			_index: getIndexName(),
			_type: 'businessEvent',
			_id: businessEvent.id
		}
	}) + '\n';
	this.bufferBody += JSON.stringify(businessEvent) + '\n';
	this.bufferLength += 1;
	this.manageTimeout();
};

/**
 * Create and return a BulkIndexer object.
 */
exports.bulkIndexer = function(url, bufferLength, maxDelay) {
	return new BulkIndexer(url, bufferLength, maxDelay);
};