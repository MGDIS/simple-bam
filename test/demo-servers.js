require('should');
var request = require('request');

var config = require('../demo-servers/config');
var appEsSimple = require('../demo-servers/app-es-simple');
var appEsMongo = require('../demo-servers/app-es-mongo');

var eventValid = require('./resources/event_valid.json');

var url = 'http://localhost:' + config.port;

describe('demo server', function() {

	describe('simple ElasticSearch based application', function() {

		after(appEsSimple.shutdown);

		it('should be executable', appEsSimple.run); // in a test not a before so that NOCK can record its request

		it('should support creating a tenant', function(callback) {
			request.put(url + '/mytenant', function(err, response) {
				if (err) return callback(err);
				response.statusCode.should.equal(200);
				callback();
			});
		});

		it('should support posting an event', function(callback) {
			request.post({
				uri: url + '/mytenant/event',
				json: eventValid
			}, function(err, response) {
				if (err) return callback(err);
				response.statusCode.should.equal(201);
				response.body.should.have.property('id');
				callback();
			});
		});

	});

	describe('Mongodb and ElasticSearch application', function() {
		
		after(appEsMongo.shutdown);

		it('should be executable', appEsMongo.run); // in a test not a before so that NOCK can record its request

		it('should support creating a tenant', function(callback) {
			request.put(url + '/mytenant', function(err, response) {
				if (err) return callback(err);
				response.statusCode.should.equal(200);
				callback();
			});
		});

		it('should support posting an event', function(callback) {
			request.post({
				uri: url + '/mytenant/event',
				json: eventValid
			}, function(err, response) {
				if (err) return callback(err);
				response.statusCode.should.equal(201);
				response.body.should.have.property('id');
				callback();
			});
		});

	});


});