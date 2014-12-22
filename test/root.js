// Some global before and after for the test suite

var fs = require('fs');
var nock = require('nock');
var tk = require('timekeeper');

// freeze time so that time-based indexes do not change in the tests data
var time = new Date(1418042875018);
tk.travel(time);

if (process.env.NOCK_OFF && process.env.NOCK_RECORD) {
	// If HTTP mocks using Nock are disabled and recording is asked for using environement variables
	// then record a mock file for each individual test of the suite

	before(function() {
		nock.recorder.rec({
			output_objects: true,
			dont_print: true
		});
	});
	beforeEach(function() {
		nock.recorder.clear();
	});
	afterEach(function() {
		var nockCalls = nock.recorder.play();
		var mockFilePath = './test/mocks/' + this.currentTest.title.replace(/\s/g, '_') + '.json';
		if (nockCalls && nockCalls.length > 0) {
			fs.writeFileSync(mockFilePath, JSON.stringify(nockCalls, null, 4));
			console.log('Nock recorded some requests and wrote to "%s"', mockFilePath);
		}
	});
} else if (!process.env.NOCK_OFF) {
	// If HTTP mocks using Nock are active the load o mock file for each individual test

	beforeEach(function() {
		var mockFilePath = './test/mocks/' + this.currentTest.title.replace(/\s/g, '_') + '.json';
		if (fs.existsSync(mockFilePath)) {
			console.log('Loading mocks from "%s"', mockFilePath);
			nock.load(mockFilePath);
		}
	});
}