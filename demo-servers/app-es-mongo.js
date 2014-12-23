/**
 * BAM demonstration server. Index events to ElasticSearch.
 *
 * WARNING: this server uses bulk indexing.
 * It is not necessarily a goot idea to do so as it implies
 * an application state in memory and the possibility of information loss in case of shutdown.
 *
 * This server is voluntarily minimalist about configuration, authentication, authorization, etc.
 * Its purpose is only to illustrate a valid usage of simple-bam, not to be fit for production.
 */

var bam = require('../');
var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var async = require('async');

var config = require('./config');

var app = express();
var db = null;

var bulkIndexer = bam.elasticsearch.bulkIndexer(config.elasticsearch);

bulkIndexer.on('flush', function(nb){
	console.log('Flushed %s business events to ElasticSearch bulk API', nb);
});

// This route creates a new tenant for the service.
// If you are not concerned with multi-tenancy you can simply use bam.elasticsearch.createTenantAlias once at init.
app.put('/:tenantId', function(req, res, next) {
	bam.elasticsearch.createTenantAlias(config.elasticsearch, req.params.tenantId, function(err) {
		if (err) return next(err);
		res.sendStatus(200);
	});
});

// This route validates an incoming businessEvent object, ensures that it is correlated to the right tenant
// save it in mongodb and ask for indexing it into elasticsearch in bulk mode
app.post('/:tenantId/event', bodyParser.json(), bam.validation.middleware, function(req, res, next) {
	var businessEvent = req.body;
	// can safely assume that businessEvent has a correlation key.
	// it is ensured by the validation middleware
	businessEvent.correlation.tenantId = req.params.tenantId;

	bam.mongodb.save(db, businessEvent, new mongodb.ObjectID(), function(err, savedEvent){
		if (err) return next(err);
		bulkIndexer.index(savedEvent);
		res.status(201).send(savedEvent);
	});

});

exports.app = app;

// Some asynchronous init and shutdown functions
var prepareMongo = function(callback) {
	mongodb.MongoClient.connect(config.mongodb, callback);
};
var prepareES = function(callback) {
	bam.elasticsearch.configure(config.elasticsearch, callback);
};
var shutdownMongo = function(callback) {
	db.close(callback);
};
var shutdownServer = function(callback) {
	server.close(callback);
};

// Exports run and shutdown functions so the app can be used through an outside launcher
var server;
exports.run = function(callback) {
	// Wait for the mongo database and the elasticsearch cluster to be configured properly before activating the server
	async.parallel([prepareMongo, prepareES], function(err, results) {
		if (err) return callback(err);
		db = results[0];
		server = app.listen(config.port, function(err) {
			callback(err);
		});
	});
};

exports.shutdown = function(callback) {
	async.parallel([shutdownMongo, shutdownServer], callback);
};

// If this file is main launcher, run the server right now.
if (require.main === module) {
	exports.run(function(err) {
		if (err) console.error(err);
		else console.log('Example app listening at http://localhost:%s', config.port);
	});
}