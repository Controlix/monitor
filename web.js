var express = require('express');
var request = require('request');
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

function loop(host, port, url) {
	info.hosts[host] = {};
	console.log('http://' + host + ':' + port + url);

	var req = request.defaults({
      baseUrl: 'http://' + host + ':' + port + url
	});

	req
	  .get('/health')
	  .on('data', function (data) {
	  	info.hosts[host].status = JSON.parse(data).status;
	  })
	  .on('error', function(error) {
	  	info.hosts[host].status = 'UNKNOWN';
	  });

	req
	  .get('/info')
	  .on('data', function (data) {
	  	info.hosts[host].app = JSON.parse(data).app;
	  })
	  .on('error', function(error) {
	  	info.hosts[host].app = 'UNKNOWN';
	  });

	info.count++;
	setTimeout(function () {loop(host, port, url);}, 1000);
}



loop('localhost', 8090, '/');
loop('nieuw.ad.nl', 80, '/monitor');
