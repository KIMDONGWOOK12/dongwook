'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// NOTE: After modifying this, run npm run build:ssh-ask-client
var http = require('http');
// This is either a local port, or a socket path
var handle = process.env.ANTIGRAVITY_SSH_ASKPASS_HANDLE;
if (!handle) {
	console.error(
		'Error: ANTIGRAVITY_SSH_ASKPASS_HANDLE environment variable is not set',
	);
	process.exit(1);
}
var request = {
	request: process.argv.slice(2).join(' '),
};
// Determine if handle is a port number or socket path
var isPort = !isNaN(parseInt(handle, 10));
var options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
};
// Set connection details based on handle type
if (isPort) {
	options.port = parseInt(handle, 10);
	options.hostname = 'localhost';
} else {
	options.socketPath = handle;
}
// Create request with appropriate error handling
var clientRequest = http.request(options, function (res) {
	var data = '';
	// Handle response status
	if (res.statusCode !== 200) {
		console.error('Server returned status code: '.concat(res.statusCode));
		process.exit(1);
	}
	res.on('data', function (chunk) {
		data += chunk;
	});
	res.on('end', function () {
		// Write response to stdout without any additional formatting
		process.stdout.write(data);
	});
	res.on('error', function (error) {
		console.error('Error receiving response: '.concat(error.message));
		process.exit(1);
	});
});
clientRequest.on('error', function (error) {
	if (isPort) {
		console.error(
			'Error connecting to port '
				.concat(handle, ': ')
				.concat(error.message),
		);
	} else {
		console.error(
			'Error connecting to socket '
				.concat(handle, ': ')
				.concat(error.message),
		);
	}
	process.exit(1);
});
// Write the request body
clientRequest.write(JSON.stringify(request));
clientRequest.end();
