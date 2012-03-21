if(typeof(exports)=='undefined') exports = {};

if(typeof(__dirname)=='undefined')
    var parse_path = window.location.hostname;
else
    var parse_path = __dirname;

exports.pretty_name = 'Battle Rating';
exports.subtitle = 'Competive Rating For Friends';
exports.about = 'Battle Rating tracks your skill level compared to your friends in any number of games.';

exports.password_salt = 'asjfljwelro23u4oslljfljwerasfxc';
var domain = 'battlerating.com';
exports.email = 'support@'+domain;

exports.db_name = 'battlerating';
exports.port = 7010;
var message = 'running prod';
if(utils.is_substr('dev.'+domain, parse_path)){
    var message = 'running dev';
    exports.db_name = exports.db_name+'_dev';
    exports.port += 1
}

console.log(message);

exports.domain = domain;
exports.data_url = 'http://'+domain+':'+exports.port;

var config = exports;
