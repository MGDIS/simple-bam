var should = require('should');
var request = require('request');

var elasticsearch = require('../lib/elasticsearch');

var eventValid = require('./resources/event_valid.json');
var url = 'http://localhost:9200';

describe('elasticsearch connector', function() {

	describe('configure function', function() {

		it('should create indexes and aliases', function(callback) {
			elasticsearch.configure(url, function(err) {
				should.not.exist(err);

				request(url + '/businessevents', function(err, response) {
					should.not.exist(err);
					response.statusCode.should.equal(200);
					callback();
				});
			});
		});

	});

	describe('createTenantAlias function', function() {

		it('should create a filtered alias per tenant', function(callback) {
			elasticsearch.createTenantAlias(url, 'tenantTest', function(err) {
				should.not.exist(err);

				request(url + '/tenantTest-businessevents', function(err, response) {
					should.not.exist(err);
					response.statusCode.should.equal(200);
					callback();
				});
			});
		});

	});

	describe('index function', function() {

		it('should index an event object', function(callback) {
			elasticsearch.index(url, eventValid, function(err, indexedEvent) {
				should.not.exist(err);
				should.exist(indexedEvent);
				indexedEvent.should.have.property('id');
				callback();
			});
		});
	});

	describe('BulkIndexer object', function() {
		var bulkIndexer = null;
		beforeEach('should be initialized by the bulkIndexer function', function() {
			bulkIndexer = elasticsearch.bulkIndexer(url, 10, 10);
			bulkIndexer.index.should.be.of.type('function');
		});

		it('should receive a businessEvent to index and flush it', function(callback) {
			bulkIndexer.once('flush', function(nbFlushed) {
				nbFlushed.should.equal(1);
				callback();
			});

			bulkIndexer.index(eventValid);
			bulkIndexer.flush();
		});

		it('should flush automatically when max buffer length is attained', function(callback) {
			bulkIndexer.once('flush', function(nbFlushed) {
				nbFlushed.should.equal(10);
				callback();
			});

			for (var i = 0; i < 10; i++) {
				bulkIndexer.index(eventValid);
			}

		});

		it('should flush automatically when delay is attained', function(callback) {
			bulkIndexer.once('flush', function(nbFlushed) {
				nbFlushed.should.equal(2);
				callback();
			});

			bulkIndexer.index(eventValid);
			bulkIndexer.index(eventValid);
		});

	});
});