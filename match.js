var fs = require('fs');
var ejs = require('ejs')
ejs.open = '[%';
ejs.close = '%]';

var phrase_maker = require('./phrase_maker.js');
app.get('/match/new', utils.setVals, function(req, res, next){

    res.render('match/new.html', req.vals);
});

app.get('/match/set_winner', utils.setVals, function(req, res, next){

});


app.post('/match/create', utils.setVals, function(req, res, next){
    var vals = req.vals;
    var err = vals.err;
    if(req.body){
	var sub = req.body;
    }
    vals.sub = sub;
    console.log(sub);
    validate('game', sub.game, err,
	     [
		 'isOneOf:foosball',
	     ]);
    validate('variant', sub.variant, err,
	     [
		 'isOneOf:standard',
	     ]);
    validate('match_type', sub.match_type, err,
	     [
		 'isOneOf:1_vs_1,2_vs_2',
	     ]);
    if(err.length>0)
	return res.render('match/new.html', req.vals);
    var team_size = 1;
    if(sub.match_type=='2_v_2')
	team_size = 2;
    sub.team_size = team_size;
    var players = [];
    for(var t=0; t<=1; t++){
	for(var p=0; p<team_size; p++){
	    var player = sub.descend('teams', t, p);
	    player=player.toLowerCase().trim();
	    validate('team '+(t+1)+': player '+(p+1), player, err,
		     [
			 'requiredChar:@',
			 'requiredChar:.',
		     ]);
	    if(player)
		players.push(player);
	}
    }
    sub.players = players;
    //validate captcha
    if(!req.no_captcha){
	if(!v.checkCaptcha(sub.captcha_id, sub.captcha)){
	    err.push('Captcha did not match typed in code');
	}
    }
    sub.match_code = utils.randomString(20);

    if(err.length>0)
	return res.render('match/new.html', req.vals);

    sub.match_name = phrase_maker.project();
    var fields = ['game', 'variant', 'match_type', 'match_name', 'teams', 'players', 'match_code']
    var record = {};
    for(var i in fields){
	var field = fields[i];
	record[field] = sub[field];
    }
    db.c('match').save(record, function(err, record){
	for(var p in players){
	    var data = utils.cloneObject(sub);
	    data.player = players[p];
	    data.submit_code = utils.md5(data.player+sub.match_code);
	    data._id = record._id;
	    var message = template_functions.render('match/email.txt', data);
	    utils.emailer.send({
		text:    message,
		from:    "support@foosratings.com", 
		to:      data.player,
		subject: 'Who one the '+sub.game+' match called '+sub.match_name+'?'
	    });
	}
    });
    req.vals.match_name = sub.match_name;
    res.render('match/create.html', req.vals);

});


