fs = require('fs');

var pub = __dirname + '/public';
request = require('request');

utils = require(pub+'/utils.js');
p_utils = require('./p_utils.js');

for(var f in p_utils)
    utils[f] = p_utils[f];
config = require('./config.js');
var email   = require("emailjs");
utils.emailer  = email.server.connect({});

var util   = require('util');
var spawn = require('child_process').spawn;
var sanitizer = require('sanitizer');
var express = require('express');
var request = require('request');
var sys = require('sys');
Canvas = require('canvas');
ejs = require('ejs');
sanitizer = require('sanitizer');

mongodb = require('mongodb');
db = require('./db.js');
db.init(config.db_name);
var start_time = getTime();
v = require('./template_functions.js');
validate = require('./validate.js').validate;
app = express.createServer();
app.use(express.bodyParser());
app.use(express.static(pub));
app.use(express.errorHandler({ dump: true, stack: true }));
app.use(express.cookieParser());
app.use(express.session({ secret: utils.randomString(40) }));
app.use(app.router);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.register('.html', require('ejs'));
app.set('view options', {
    open: '[%',
    close: '%]'
});

setInterval(function(){
    utils.killIfEdited(__filename);
}, 1000);


function error(res, message){
    res.render('error.html', {error:message});
}

var users = require('./users.js');

/*Custom Routes*/
app.get('/', utils.setVals, function(req, res, next){
    if(req.session.user && req.session.user.username){
	res.writeHead(303, {
	    'Location': '/home'
	});
	return res.end();
    }
    res.render('index.html', req.vals)
});

app.get('/home', utils.setVals, function(req, res, next){
    console.log(req.session);

    res.render('home.html', req.vals);
});
/*end custom routes*/

/*Get the party started...*/
app.listen(config.port);
console.log('started - port:'+config.port);