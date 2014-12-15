// Some global before and after test processing

var fs = require('fs');
var nock = require('nock');

if (process.env.NOCK_OFF && process.env.NOCK_RECORD) {
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
		fs.writeFileSync(mockFilePath, JSON.stringify(nockCalls, null, 4));
		if (nockCalls && nockCalls.length > 0) {
			console.log('Nock recorded some requests and wrote to "%s"', mockFilePath);
		}
	});
} else if (!process.env.NOCK_OFF){
	beforeEach(function() {
		var mockFilePath = './test/mocks/' + this.currentTest.title.replace(/\s/g, '_') + '.json';
		console.log('Loading mocks from "%s"', mockFilePath);
		nocks = nock.load(mockFilePath);
	});
}