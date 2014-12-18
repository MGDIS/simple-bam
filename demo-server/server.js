var config = require('./config');
var runApp = require('./app').run;

runApp(function(err) {
	if (err) console.error(err);
	else console.log('Example app listening at http://localhost:%s', config.port);
});