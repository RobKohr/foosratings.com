var phrase_maker = require('./phrase_maker.js');
app.get('/match/new', utils.setVals, function(req, res, next){

    res.render('match/new.html', req.vals);
});

app.post('/match/create', utils.setVals, function(req, res, next){

    if(vals.err.length>0){
	res.render('match/new.html', req.vals);
    }
    console.log(phrase_maker.project());
    res.render('match/create.html', req.vals);
});