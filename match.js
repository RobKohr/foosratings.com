var fs = require('fs');
var ejs = require('ejs')
ejs.open = '[%';
ejs.close = '%]';

var statsLink = function(email,game){
  var email = encodeURIComponent(email);
  return '/stats?email='+email+'&game='+escape(game)+'&key='+utils.md5(email+keymaker);
}


var phrase_maker = require('./phrase_maker.js');
app.get('/match/new', utils.setVals, function(req, res, next){
    res.render('match/new.html', req.vals);
});

app.get('/match/set_winner', utils.setVals, function(req, res, next){
    var q = req.query;
    if(!q) q = {};
    req.vals.query = q;
    var required_fields = ['team', 'submitter', 'submit_code', '_id'];
    required_fields.each(function(field){
	if(!req.query[field])
	    return error(res, field + ' is a required field');
    });
    db.c('match').findOne({_id:docId(req.query._id)}, function(err, match){
	if(!match)
	    return error(res, 'match not found');
	req.vals.match = match;
	var expected_submit_code = utils.md5(q.submitter+match.match_code);
	if(q.submit_code != expected_submit_code)
	    return error(res, 'Invalid Submit Code ' + expected_submit_code + ' - '+ q.submit_code);
	if(!match.player_responses)
	    match.player_responses = {};
	var team = Number(q.team);
	if((team!=0)&&(team!=1))
	    return error(res, 'Invalid team');
	match.player_responses[q.submitter] = team;
	if(!utils.inArray(q.submitter, match.players))
	    return error(res, 'You were not a player in this game');
	var winning_team = match.teams[team];
	var adjust_ratings = 0;
	if(utils.inArray(q.submitter, winning_team)){
	    if(!match.resolved){
		req.vals.message = 'Congratulation, you win! <br>For this match to be resolved and your rating adjusted, the other team must also recognize the loss';
	    }else{
		req.vals.message = 'Congratulation, you win! Your rating has now been adjusted!';
	    }
	}else{
	    req.vals.message = 'This match is now resolved and ratings have been adjusted. Better luck next time!';
	    if((!match.resolved)||(!match.rating_adjusted)){
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
	req.vals.statsLink = statsLink;
	db.c('match').save(match);
	if(adjust_ratings){
	    exports.adjustRatings(
		[match.winning_team, match.losing_team], 
		match,
		function(){
		    setWinner(req, res, next);

		}
	    );
	}else{
	    setWinner(req, res, next);
	}
    });
});

exports.adjustRatings = function(teams, match, callback){
    console.log('a1');
    teamsEmailsToTeamsPlayers(teams, match.game, function(teams){
	glicko.teamMatch(teams, {match_id:docId(match._id)});
	utils.debug(['After glicko', teams]);
	savePlayersInTeams(teams, match.players);
	callback();
    });
}

savePlayersInTeams = function(teams, friends){
    teams.each(function(team){
	team.players.each(function(player, index){
	    if(!player.friends)
		player.friends = [];
	    friends.each(function(friend){
		if(!utils.inArray(friend, player.friends)){
		    player.friends.push(friend);
		}
	    });

	    db.c('player').save(player);
	})
    })
}


arrayOfArraysToFlatArray = function(arr){
    var out = [];
    console.log(arr);
    arr.each(function(sub_arr){
	sub_arr.each(function(el){
	    out.push(el);
	});
    });
    return out;
}

emailArrayToIdOrQuery = function(arr){
    var els = [];
    arr.each(function(email){
	els.push({email:email});
    });
    return {$or:els};
}
//teams is nested array of emails. players if flat array of player objects
//output teams in a format glicko.teamMatch can process
formatTeamObjects = function(teams, players, game){
    var player_lookup = {};
    players.each(function(player){
	player_lookup[player.email] = player;
    });
    teams.each(function(team, team_index){
	var player_email_list = team;
	team = {players:[], rank:team_index};
	player_email_list.each(function(email){
	    var player = player_lookup[email];
	    if(!player)
		player = {email:email, game:game};
	    team.players.push(player);
	});
	teams[team_index] = team;
    });
    return teams;
}

//takes array of teams, with array of emails, and returns array of teams with player objs
teamsEmailsToTeamsPlayers = function(teams, game, callback){
    var player_emails = arrayOfArraysToFlatArray(teams);
    var query = emailArrayToIdOrQuery(player_emails);
    query.game = game;
    var teams_ = teams;	
    db.c('player').find(query).toArray(function(err, players){
	var teams = teams_; //resolve scoping issue.
	var teams = formatTeamObjects(teams, players, game);
	callback(teams);
    });
}


var setWinner = function(req, res, next){
    return res.render('match/set_winner.html', req.vals);
}



app.post('/match/create', utils.setVals, function(req, res, next){
    var vals = req.vals;
    var err = vals.err;
    if(req.body){
	var body = req.body;
    }
    vals.body = body;
    validate('game', body.game, err,
	     [
		 'isOneOf:foosball',
	     ]);
    validate('variant', body.variant, err,
	     [
		 'isOneOf:standard',
	     ]);
    validate('match_type', body.match_type, err,
	     [
		 'isOneOf:1_vs_1,2_vs_2',
	     ]);
    if(err.length>0)
	return res.render('match/new.html', req.vals);
    var team_size = 1;
    if(body.match_type=='2_vs_2')
	team_size = 2;
    body.team_size = team_size;
    var players = [];
    for(var t=0; t<=1; t++){
	for(var p=0; p<team_size; p++){
	    var player = body.descend('teams', t, p);
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
    body.players = players;
    console.log(body);

    //validate captcha
    if(!req.no_captcha){
	if(!v.checkCaptcha(body.captcha_id, body.captcha)){
	    err.push('Captcha did not match typed in code');
	}
    }
    body.match_code = utils.randomString(20);

    if(err.length>0)
	return res.render('match/new.html', req.vals);

    body.match_name = phrase_maker.project();
    var fields = ['game', 'variant', 'match_type', 'match_name', 'teams', 'players', 'match_code']
    var record = {};
    for(var i in fields){
	var field = fields[i];
	record[field] = body[field];
    }
    db.c('match').save(record, function(err, record){
	for(var p in players){
	    var data = utils.cloneObject(body);
	    data.player = players[p];
	    data.submit_code = utils.md5(data.player+body.match_code);
	    data._id = record._id;
	    data.game = record.game;
	    data.statsLink = statsLink;
	    var message = template_functions.render('match/email.txt', data);
	    utils.emailer.send({
		text:    message,
		from:    "match@foosratings.com", 
		to:      data.player,
		subject: 'Who won the '+body.game+' match called '+body.match_name+'?'
	    });
	}
    });
    req.vals.match_name = body.match_name;
    req.vals.players = body.players;
    res.render('match/create.html', req.vals);

});


