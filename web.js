var express = require('express');
var request = require('request');
var cons = require('consolidate');
var hosts = require('./hosts.json');

var app = express();

var info = {};
info.count = 0;
info.hosts = {};

app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');

app.get('/', function (req, res) {
	res.render('index', {count: info.count, hosts: toArray(info.hosts)});
  	// res.send(info);
});

function toArray(hosts) {
	return Object.keys(hosts).map(function(key) {
		return {name: key, status: hosts[key].status, app: hosts[key].app};
	});

};

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

function loop(host) {
	info.hosts[host.host] = {};
	console.log('checking ' + host.host + '...');

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
	setTimeout(function () {loop(host);}, 5000);
};

for (host of hosts) {
	loop(host);
};
