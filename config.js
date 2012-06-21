if(typeof(exports)=='undefined') exports = {};

if(typeof(__dirname)=='undefined')
    var parse_path = window.location.hostname;
else
    var parse_path = __dirname;

exports.ga_account = 'set_me';
exports.pretty_name = 'FoosRatings';
exports.subtitle = 'Competitive Ratings For Friends';
exports.about = exports.pretty_name+' tracks your skill level in foosball and other games compared to your friends.';

exports.password_salt = 'asjfljwelro23u4oslljfljwerasfxc';
var domain = 'foosratings.com';
exports.email = 'support@'+domain;

exports.db_name = 'foosratings';
exports.port = 7010;
exports.server = 'prod';
var message = 'running prod';
if(utils.is_substr('dev.'+domain, parse_path)){
    var message = 'running dev';
    exports.server = 'dev';
    exports.db_name = exports.db_name+'_dev';
    exports.port += 1
}

console.log(message);

exports.domain = domain;
exports.data_url = 'http://'+domain+':'+exports.port;

var config = exports;
