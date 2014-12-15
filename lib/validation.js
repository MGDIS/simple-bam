var JaySchema = require('jayschema');
var js = new JaySchema();

var schema = require('../resources/business-event-schema.json');

/**
 * Validate an event object against the businessEvent JSON schema.
 *
 * @param event {object} event
 * @param callback {function} callback - will be called with either an array of validation errors or nothing
 */
exports.validate = function(event, callback) {
	js.validate(event, schema, callback);
};

/**
 * Express/connect middleware to validate the body of a request against the businessEvent JSON schema.
 * If the validation fails the middleware will respond with a 400 error status code and send the validation errors in the response body.
 */
exports.middleware = function(req, res, next) {
	js.validate(req.body, schema, function(errs){
		if (errs) {
			res.send(400, errs);
		} else {
			next();
		}
	});
};