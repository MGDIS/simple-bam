var should = require('should');
var request = require('request');
var nock = require('nock');

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
			elasticsearch.index('http://localhost:9200', eventValid, function(err) {
				should.not.exist(err);
				callback();
			});
		});

	});

});