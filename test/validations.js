var should = require('should');
var _ = require('lodash');

var validation = require('../lib/validation');

var eventValid = require('./resources/event_valid.json');
var eventInvalid = _.omit(eventValid, 'version');

describe('businessEvent schema validation', function() {
	it('should accept a valid event object', function(callback) {
		validation.validate(eventValid, function(errs) {
			should.not.exist(errs);
			callback();
		});
	});

	it('should reject an invalid event object', function(callback) {
		validation.validate(eventInvalid, function(errs) {
			errs.should.have.lengthOf(1);
			callback();
		});
	});
});


describe('businessEvent schema validation middleware', function() {
	it('should accept a valid event request', function(callback) {
		var req = {
			body: eventValid
		};

		validation.middleware(req, null, function(err){
			should.not.exist(err);
			callback();
		});
	});

	it('should reject an invalid event request', function(callback) {
		var req = {
			body: eventInvalid
		};

		var res = {
			status: function(code) {
				code.should.equal(400);
				return res;
			},
			send: function(errs){
				errs.should.have.lengthOf(1);
				callback();
			}
		};

		validation.middleware(req, res, null);
	});

});