var templates = {};

exports.render = function(file, data){
    if(!templates[file])
	templates[file] = fs.readFileSync('./views/'+file);
    return ejs.render('hi <%=aa%> there', {aa:'This is test'});    
}

exports.formatBitcoins = function(btc){
    if(!btc)
	btc = 0;
    btc = Number(btc);
    btc = btc.toFixed(3);
    return btc+' BTC';
}


exports.cleanTitle = function(path){
    var path =  utils.str_replace('-', ' ', path);
    var title = utils.explode('/', path)
    title = utils.last(title);
    return title;
}

exports.input = function(p, input_defaults){
    if(!input_defaults)
	input_defaults = {};
    if(!p.type) p.type='text';
    var extras = p.extras;
    if(!p.label) p.label = utils.pretty(p.name);
    if(typeof(extras)=='undefined') extras = {};
    if(typeof(extras.required)=='undefined') extras.required = 'required';
    if(extras.required=='') delete extras.required;
    if((!extras.value) && (input_defaults[p.name])){
	extras.value = input_defaults[p.name];
    }

    var extras_str = '';
    for(var field in extras){
	var val = extras[field];
	extras_str+= ' '+field+'="'+val+'"';
    }
    

    var input = '<input type="'+p.type+'" id="field_'+p.name+'" name="'+p.name+'" '+extras_str+' style="width:400px"/>';
    if(p.type=='textarea'){
	if(!extras.value) extras.value = '';
      var input = '<textarea style="width:400px" id="field_'+p.name+'" name="'+p.name+'" '+extras_str+'>'+extras.value+'</textarea>';
    }
    if(p.type=='select'){
	var input = ['<select name="'+p.name+'" id="field_'+p.name+'">'];
	if(extras.value){
	    var val = extras.value;
	    input.push('<option value="'+val+'">'+val+'</option>');
	}
	for(var i in p.options){
	    var display = p.options[i];
	    var val = display;
	    var display = sanitizer.escape(display);
	    var val = sanitizer.escape(val);
	    if(!utils.is_array(p.options))
		var val = i;
	    input.push('<option value="'+val+'">'+display+'</option>');
	}
	input.push('</select>');
	input = input.join('');
    }
    


  var out = [
      '<div style="position:relative;" id="input_row_'+p.name+'" class="input_row">',
      '<label for="'+p.name+'" id="label_'+p.name+'">',
      p.label,
      '</label>',
      '<div class="input_container">'+input+'</div>'
  ];
    if(p.note){
	out.push('<div class="note">'+p.note+'</div>');
    }
    out.push('</div>');

    var out = out.join("\n");
  return out; 
}

var captcha_answers = {};
exports.captcha_answers = captcha_answers;
exports.captcha = function(){
    var chars = "abcdefghiklmnpqrstuvwxyz";
    var id = utils.randomString(4, chars);
    var str = utils.randomString(4, chars);
    captcha_answers[id] = {answer:str, created:getTime()};
    console.log(captcha_answers);
    var canvas = new Canvas(75,20)
    var ctx = canvas.getContext('2d');
    ctx.font = '20';
    ctx.fillText(str, 10, 14);
    var te = ctx.measureText(str);
    out = '<p>Type this code: <img height="30" src="' + canvas.toDataURL() + '" /> ';
    out+= '<input type="hidden" name="captcha_id" value="'+id+'"> ';
    out+= 'here -&gt; <input name="captcha"></p>';
    return out;
}
exports.checkCaptcha = function(id, ans){
    if(!captcha_answers[id])
	return false;

    if(ans == captcha_answers[id].answer){
	delete captcha_answers[id];
	return true
    }
    return false;
}
