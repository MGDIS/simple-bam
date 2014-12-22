/**
 * BAM demonstration server. Index events to ElasticSearch.
 *
 * This server is voluntarily minimalist about configuration, authentication, authorization, etc.
 * Its purpose is only to illustrate a valid usage of simple-bam, not to be fit for production.
 */

var bam = require('../');
var express = require('express');
var bodyParser = require('body-parser');

var config = require('./config');

var app = express();

// This route creates a new tenant for the service.
// If you are not concerned with multi-tenancy you can simply use bam.elasticsearch.createTenantAlias once at init.
app.put('/:tenantId', function(req, res, next) {
	bam.elasticsearch.createTenantAlias(config.elasticsearch, req.params.tenantId, function(err) {
		if (err) return next(err);
		res.sendStatus(200);
	});
});

// This route validates an incoming businessEvent object, ensures that it is correlated to the right tenant
// and triggers its indexing into elasticsearch
app.post('/:tenantId/event', bodyParser.json(), bam.validation.middleware, function(req, res, next) {
	var businessEvent = req.body;

	// can safely assume that businessEvent has a correlation key.
	// it is ensured by the validation middleware
	businessEvent.correlation.tenantId = req.params.tenantId;

	bam.elasticsearch.index(config.elasticsearch, businessEvent, function(err, indexedEvent) {
		if (err) return next(err);
		res.status(201).send(indexedEvent);
	});
});

exports.app = app;

// Exports run and shutdown functions so the app can be used through an outside launcher
var server;
exports.run = function(callback) {
	// Wait for the elasticsearch cluster to be configured properly before activating the server
	bam.elasticsearch.configure(config.elasticsearch, function(err) {
		if (err) return callback(err);
		server = app.listen(config.port, function(err) {
			callback(err);
		});
	});
};

exports.shutdown = function(callback) {
	server.close(callback);
};

// If this file is main launcher, run the server right now.
if (require.main === module) {
	exports.run(function(err) {
		if (err) console.error(err);
		else console.log('Example app listening at http://localhost:%s', config.port);
	});
}