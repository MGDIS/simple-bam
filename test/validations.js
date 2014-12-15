var should = require('should');

var validation = require('../lib/validation');

var eventValid = require('./resources/event_valid.json');

describe('businessEvent schema validation', function() {
	it('should accept a valid event object', function(callback) {
		validation.validate(eventValid, function(errs) {
			should.not.exist(errs);
			callback();
		});
	});

	it('should reject an invalid event object', function(callback) {
		delete eventValid.version;
		validation.validate(eventValid, function(errs) {
			errs.should.have.lengthOf(1);
			callback();
		});
	});
});