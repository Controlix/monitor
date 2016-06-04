var express = require('express');
var request = require('request');
var hosts = require('./hosts.json');

var app = express();

var info = {};
info.count = 0;
info.hosts = {};

app.get('/', function (req, res) {
  res.send(info);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function loop(host) {
	info.hosts[host.host] = {};

	var req = request.defaults({
      baseUrl: 'http://' + host.host + ':' + host.port + host.url
	});

	req
	  .get('/health')
	  .on('data', function (data) {
	  	info.hosts[host.host].status = JSON.parse(data).status;
	  })
	  .on('error', function(error) {
	  	info.hosts[host.host].status = 'UNKNOWN';
	  });

	req
	  .get('/info')
	  .on('data', function (data) {
	  	info.hosts[host.host].app = JSON.parse(data).app;
	  })
	  .on('error', function(error) {
	  	info.hosts[host.host].app = 'UNKNOWN';
	  });

	info.count++;
	setTimeout(function () {loop(host);}, 1000);
};

for (host of hosts) {
	loop(host);
};
