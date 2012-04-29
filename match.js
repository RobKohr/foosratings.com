var fs = require('fs');
var ejs = require('ejs')
ejs.open = '[%';
ejs.close = '%]';

var phrase_maker = require('./phrase_maker.js');
app.get('/match/new', utils.setVals, function(req, res, next){

    res.render('match/new.html', req.vals);
});

app.get('/match/set_winner', utils.setVals, function(req, res, next){
    console.log(req.query);
    var required_fields = ['team', 'submitter', 'submit_code', '_id'];
    for(var i in required_fields){
	var field = required_fields[i];
	if(!req.query[field])
	    return error(res, field + ' is a required field');
    }
    db.c('match').findOne({_id:docId(req.query._id)}, function(err, match){
	if(!match)
	    return error(res, 'match not found');
	var expected_submit_code = utils.md5(req.submitter+match.match_code);
	if(req.submit_code != expected_submit_code)
	    return error(res, 'Invalid Submit Code');
	if(!match.player_responses)
	    match.player_responses = {};
	var team = Number(req.team);
	if((team!=0)&&(team!=1))
	    return error(res, 'Invalid team');
	match.player_responses[req.submitter] = team;
	if(!utils.inArray(req.submitter, match.players))
	    return error(res, 'You were not a player in this game');
	var winning_team = match.teams[team];
	var adjust_ratings = 0;
	if(utils.inArray(req.submitter, winning_team)){
	    if(!match.resolved){
		req.vals.notice.push('Congratulation, you win! <br>For this match to be resolved and your rating adjusted, the other team must also recognize the loss');
	    }else{
		req.vals.notice.push('Congratulation, you win! Your rating has now been adjusted!');
	    }
	}else{
	    req.vals.notice.push('This match is now resolved and ratings have been adjusted. Better luck next time!');
	    if(!match.resolved){
		match.resolved = 1;
		match.winner = team;
		match.winning_team = match.teams[team];
		if(team == 1)
		    match.losing_team = match.teams[0];
		else
		    match.losing_team = match.teams[1];
		adjust_ratings = 1;
	    }
	}
	db.c('match').save(match);
	if(adjust_ratings){
	    exports.adjustRatings(
		[match.winning_team, match.losing_team], 
		function(){
		    showStats(req, res, next);

		}
	    );
	}else{
	    showStats(req, res, next);
	}
    });
});

exports.adjustRatings = function(sorted_teams, callback){
    var lookup = [];
    for(var t in sorted_teams){
	for(var p in sorted_teams[t]){
	    var player = sorted_teams[t][p];	    
	    players[player] = {_id:player};
	    lookup.push({_id:player});
	}
    }

    db.c('player').find({$or:lookup}).toArray(function(err, docs){
	for(var i in docs){
	    var player = docs[i];
	    players[player._id] = player;
	}
	
    });

}

var showStats = function(req, res, next){
    return res.render('match/set_winner.html', req.vals);
}



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
		subject: 'Who won the '+sub.game+' match called '+sub.match_name+'?'
	    });
	}
    });
    req.vals.match_name = sub.match_name;
    res.render('match/create.html', req.vals);

});


