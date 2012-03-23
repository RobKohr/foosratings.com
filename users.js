exports.getUser = function(params, callback){
    if(typeof(params.password)!='undefined'){
	params.password = exports.hashPass(params.password);
    }
    db.c('user').findOne(params, function(err, user){
	return callback(user);
    });
}

exports.hashPass = function(password){
    return utils.md5(password + config.password_salt);
}

exports.checkLogin = function(req, res, next){
    if(req.session.user)
	return next();

    if(req.sub){
	var email = req.sub.email.toLowerCase();
	var password = req.sub.password;
    }
    var test = {};
    exports.getUser({email:email, password:password}, function(user){
	if(!user){
	    req.vals.err.push('User not found');
	    return res.render('users/login.html', req.vals);
	}
	req.session.user = user;
	req.err.push('success');
	return next();
    });
}

exports.loggedIn = function(req){
    if(req.session.user && req.session.user.username)
	return true;
    return false;
}


exports.register = function(req, res, next){
    var err = req.err;
    validate('email', req.sub.email, err,
	     [
		 'minNumberOfChars:3',
		 'maxNumberOfChars:600',
		 'requiredChar:@',
		 'requiredChar:.',
		 'bannedChars:<>\'"'
	     ]
	    );

    validate('display_name', req.sub.display_name, err,
	     [
		 'minNumberOfChars:3',
		 'maxNumberOfChars:600',
		 'bannedChars:<>\'"'
	     ]
	    );
    validate('password', req.sub.password, err,
	     [
		 'minNumberOfChars:5',
		 'notCommonPassword',
		 'match:'+req.sub.retype_password
	     ]);
    req.sub.activate_code = utils.randomString('10', 'abcdefghjkmnpqrstuvwxyz');
    req.sub.activated = 0;
    if(req.err.length!=0)
	return next();
    req.sub.email = req.sub.email.toLowerCase();
    req.sub.email = [req.sub.email];//multiple email addresses allowed
    var saved_values = ['username', 'email', 'password', 'activate_code', 'activated'];
    var doc = utils.filterObject(req.sub, saved_values);
    doc.password = exports.hashPass(doc.password);
    exports.getUser({email: req.sub.email}, function(user){
	if(user){

	    if(user.activated){
		req.err.push('Username already created.');
		return next();
	    }
	    doc._id = user._id;//user isn't activated, just update him.
	}
	db.c('user').save(doc);
	req.notice.push('User created. Check your email for activation link.');
	utils.emailer.send({
	    subject:config.domain + ' - New Account',
	    text:
	    [
		'A new account was created on '+config.domain+' for user '+req.sub.email,
		'',
		'To activate this user, click this link: ',
		'http://'+config.domain+'/users/activate/?code='+req.sub.activate_code
	    ].join("\n"),
	    to:req.sub.email,
	    from:config.email
	}, function(err, message) { console.log(err || message); });
	res.render('empty.html', req.vals);
    });
}


app.get('/users/login', utils.setVals, function(req, res, next){
    res.render('users/login.html', req.vals)
});
app.post('/users/login', utils.setVals, exports.checkLogin, function(req, res){
    res.redirect('/home');
});

app.post('/users/register', utils.setVals, exports.register, function(req, res, next){
    res.render('users/register.html', req.vals)
});

app.get('/users/register', utils.setVals, function(req, res, next){
    res.render('users/register.html', req.vals)
});

app.post('/users/register', utils.setVals, function(req, res, next){
    res.render('users/register.html', req.vals)
});

app.get('/users/activate', utils.setVals, function(req, res, next){
    db.c('user').findOne({activate_code:req.sub.code}, function(err, user){
	if(!user){
	    req.vals.err.push('Activation code not valid');
	    req.vals.err.push(JSON.stringify({activate_code:req.sub.code}));
	}else{
	    db.c('user').update({_id:user._id}, {$set:{activated:1}});
	    req.vals.notice.push('User activated, please <a href="/login">log in</a>.');
	}
	return res.render('empty.html', req.vals);
    });
});

