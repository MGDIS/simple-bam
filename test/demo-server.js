require('should');
var request = require('request');

var config = require('../demo-server/config');
var app = require('../demo-server/app');

var eventValid = require('./resources/event_valid.json');

var url = 'http://localhost:' + config.port;

describe('demo server', function() {

	before(app.run);
	after(app.shutdown);

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