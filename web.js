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
  console.log('Example app listening on port 3000!');
});

function loop(host) {

	var req = request.defaults({
      baseUrl: host.def.host + ':' + (host.def.port || 80) + (host.def.url || ''),
			timeout: 1000
	});

	var buf = [];
	req
	  .get('/health')
	  .on('data', function (data) {
			buf.push(data);
	  })
		.on('end', function() {
			host.status = JSON.parse(buf).status;
		})
	  .on('error', function(error) {
	  	host.status = 'UNKNOWN (' + error.code + ')';
	  });

	var buf2 = [];
	req
	  .get('/info')
	  .on('data', function (data) {
			buf2.push(data);
	  })
		.on('end', function() {
			host.app = JSON.parse(buf2).app;
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
