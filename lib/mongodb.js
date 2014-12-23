/**
 * Store a new business event in a mongodb database
 */
exports.save = function(db, businessEvent, objectId, callback) {
	businessEvent._id = objectId;
	businessEvent.id = businessEvent._id.toHexString();

	var eventsCollection = db.collection('business-events');

	eventsCollection.insert(businessEvent, function(err) {
		delete businessEvent._id;
		callback(err, businessEvent);
	});
};