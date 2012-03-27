var phrase_maker = require('./phrase_maker.js');
app.get('/match/new', utils.setVals, function(req, res, next){

    res.render('match/new.html', req.vals);
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
    console.log(sub);

    for(var t=0; t<=1; t++){
	for(var p=0; p<team_size; p++){
	    var player = sub.descend('teams', t, p);
	    validate('team '+(t+1)+': player '+(p+1), player, err,
		     [
			 'requiredChar:@',
			 'requiredChar:.',
		     ]);
	}
    }
    //validate captcha
    if(!req.no_captcha){
	if(!v.checkCaptcha(sub.captcha_id, sub.captcha)){
	    err.push('Captcha did not match typed in code');
	}
    }


    if(err.length>0)
	return res.render('match/new.html', req.vals);

    sub.match_name = phrase_maker.project();
    

    res.render('match/create.html', req.vals);
});