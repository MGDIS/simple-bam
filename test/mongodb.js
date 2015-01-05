var should = require('should');
var request = require('request');
var mongodb = require('mongodb');

var bamMongodb = require('../lib/mongodb');

var eventValid = require('./resources/event_valid.json');
var url = 'mongodb://localhost:27017/simple-bam-test';

describe('mongodb connector', function() {

	var db;
	before(function(callback){
		mongodb.MongoClient.connect(url, function(err, connectedDB){
			if (err) throw err;
			db = connectedDB;
			callback();
		});
	});

	describe('save function', function() {

		it('should insert an event into the mongo collection', function(callback) {
			var id = new mongodb.ObjectID();
			bamMongodb.save(db, eventValid, id, function(err, savedEvent) {
				should.not.exist(err);
				savedEvent.id.should.equal(id.toString());
				callback();
			});
		});

	});

});