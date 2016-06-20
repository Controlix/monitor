var express = require('express');
var request = require('request');
var cons = require('consolidate');
var hosts = require('./hosts.json');

var app = express();

var health = [];

app.engine('mustache', cons.mustache);
app.set('view engine', 'mustache');

app.get('/', function (req, res) {
	if (req.query.view === 'json') {
		res.json({hosts: health});
	}

	res.render('index', {hosts: health});
});

app.listen(3000, function () {
  console.log('Monitoring app listening on port 3000!');
});

function loop(host) {

	var req = request.defaults({
      baseUrl: host.def.host + ':' + (host.def.port || 80) + (host.def.url || ''),
			timeout: 1000,
			json: true
	});

	var buf = [];
	req
	  .get('/health')
		.on('response', function(res) {
				if (res.statusCode !== 200) {
					host.status = 'UNKNOWN (' + res.statusCode + ')';
				} else {
					res.on('data', function(data) {
						host.status = JSON.parse(data).status;
					})
				}
		})
	  .on('error', function(error) {
	  	host.status = 'UNKNOWN (' + error.code + ')';
	  });

		req
			.get('/info')
			.on('response', function(res) {
					if (res.statusCode !== 200) {
						host.status = 'UNKNOWN (' + res.statusCode + ')';
					} else {
						res.on('data', function(data) {
							host.app = JSON.parse(data).app;
						})
					}
			})
			.on('error', function(error) {
				host.app = 'UNKNOWN';
			});

	setTimeout(function () {loop(host);}, 5000);
};

for (e of hosts) {
	health.push({def: e, app: 'UNKNOWN', status: 'UNKNOWN'});
};

for (h of health) {
	loop(h);
}
