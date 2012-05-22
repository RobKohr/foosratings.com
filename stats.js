app.get('/stats', utils.setVals, function(req, res, next){
    var query = {email:req.query.email, game:req.query.game};
//    var query = {email:req.query.email};
    db.c('player').findOne(query, function(err, player){
	if(!player)
	    return error(res, 'Player not found - '+JSON.stringify(query));
	player.valid_key = (utils.md5(req.query.email+keymaker))
	req.vals.player = player;
	var first = player.nice_rating_history[0].timestamp;
	req.vals.player.first = first;
	var plot = [];
	var player_plot = {};
	player_plot.data =plotOnRange(player.nice_rating_history, first);
	player_plot.label = 'Your rating: '+ (Math.round(player.nice_rating));
	plot.push(player_plot);
	var or = orQueryFromFriends(player.friends, player.email);
	var query = {game:player.game, $or:or};
	db.c('player').find(query).toArray(function(err, players){
	    players.each(function(p){
		var player_plot = {};
		player_plot.data = plotOnRange(p.nice_rating_history, first);
		player_plot.label = p.email+': '+ (Math.round(p.nice_rating));
		plot.push(player_plot);
	    });
	    req.vals.plot = plot;
	    return res.render('stats/index.html', req.vals);
	});
    });
});

orQueryFromFriends = function(friends, self){
    var or = [];
    friends.each(function(friend){
	if(friend==self)
	    return;
	or.push({email:friend});
    });
    return or;
}


plotOnRange = function(history, start){
    var out = [];
    history.each(function(el){
	var point = [];
	point[0] = el.timestamp*1000;
	point[1] = el.rating;
	out.push(point);
    });
    return out;
}
