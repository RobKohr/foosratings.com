process.chdir(__dirname);

fs = require('fs');

var pub = __dirname + '/public';
request = require('request');

utils = require(pub+'/utils.js');
p_utils = require('./p_utils.js');
glicko = require('./glicko.js');

for(var f in p_utils)
    utils[f] = p_utils[f];
config = require('./config.js');
var email   = require("emailjs");
utils.emailer  = email.server.connect({});

var util   = require('util');
var spawn = require('child_process').spawn;
sanitizer = require('sanitizer');
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
template_functions = v;
validate = require('./validate.js').validate;
secret = require('./secret.js'); //just passwords and salts
keymaker = secret.keymaker;
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

//prevent errors from killing the server
process.on('uncaughtException', function (err) {
    console.log(err.stack);
});


setInterval(function(){
    utils.killIfEdited(__filename);
}, 1000);


error = function(res, message, template){
    data = {err:[message], notice:[]};
    return res.render('empty.html', data);
}

app.get('/', utils.setVals, function(req, res, next){
    res.render('index.html', req.vals)
});

//custom code for this project
match = require('./match.js');
stats = require('./stats.js');



/*Get the party started...*/
app.listen(config.port);
console.log('started - port:'+config.port);