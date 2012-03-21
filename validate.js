exports.validate = function(field_name, field_value, error_array, actions){
    for(var i in actions){
	var action = actions[i];
	var action = utils.explode(':', action);
	var fun = action[0];
	var param = action[1];
	if(action[2])
	    var override_error = action[2];
	var out = exports[fun](field_name, field_value, param);
	if(!out)
	    continue;
	if(action[2])
	    var out = action[2];
	error_array.push(out);
    }
    return error_array;
}

exports.isOneOf = function(field_name, field_value, opts){
    var opts = utils.explode(',', opts);
    var success = 0;
    for(var i in opts){ 
	var opt = opts[i];
	if(field_value==opt)
	    return;
    }
    return field_name+' must be one of '+ (opts.join(', '))+'. Was set to '+field_value+'.';
}

exports.bannedChars = function(field, val, chars){
    chars = utils.explode('', chars);
    for(var i in chars){
	var chr = chars;
	var err = exports.bannedChar(field, val, chr);
	if(err) return err;
    }
}
exports.bannedChar = function(field, val, chr){
    if(utils.is_substr(chr, val))
	return field+' can not contain this character: '+chr;
}

exports.requiredChar = function(field, val, chr){
    if(!utils.is_substr(chr, val))
	return field+' must contain this character: '+chr;
}

exports.match = function(field, val, match){
    if(val!=match)
	return field+' did not match';
}



exports.maxNumberOfChars = function(field, val, size){
    var size = Number(size);
    if(val.length>size)
	return field+" may not exceed "+size+" characters";
}

exports.minNumberOfChars = function(field, val, size){
    var size = Number(size);
    if((!val)||(val.length<size))
	return field+" must be at least "+size+" characters";
}

exports.mustBeginWith = function(field, val, starts_with){
    if(utils.beginsWith(starts_with, val)){
	return;
    }
    return field+' must begin with '+starts_with;
}

exports.common_passwords = [
'123456','jesus','password','love','12345678','christ','jesus1','princess','blessed','sunshine','faith','1234567','coco','angel','single','lovely','lion','will','poop','freedom','blessing','12345','grace','iloveyou','7777777','heaven','angels','shadow','1234','tigger','summer','hope','looking','mother','michael','soccer','peace','shalom','rotimi','football','happy','victory','purple','joshua','london','superman','church','loving','computer','mylove','praise','saved','pastor','123456','password','phpbb','qwerty','12345','letmein','trustno1','dragon','hello','abc123','111111','123456789','monkey','master','killer','123123','computer','asdf','shadow','internet','whatever','starwars','cheese','pass','matrix','pokemon','qazwsx','testing','football','blahblah','fuckyou','secret','password1','baseball','blessed','summer','pepper','mother','snoopy','iloveyou2','asshole','batman','spiderman','micky','mickymouse','minnimouse','eminem','50cent','diamond','scooter','flower','asdfasdf','qwertyu','uytrewq','111111','monkey','minecraft','minecraft1','password','password1','password123','kaka123','kaka12','pokemon','dragon','monkey','batman','qwerty123','hackforums','hack','life','estimate','lollipop','qwertyuiop','dragon1','654321','PASSWORD','paypal','miner1','123456','123456789','Password','iloveyou','princess','rockyou','1234567','12345678','abc123','Nicole','Daniel','babygirl','monkey','Lovely','michael','654321', 'Qwerty'];

exports.notCommonPassword = function(field, val){
    if(utils.in_array(val, exports.common_password))
	return 'This password is one of the top 100 most common passwords. Perhaps you should chose something a little more secure.';
}