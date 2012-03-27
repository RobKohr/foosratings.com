var pr = console.log;
var log = console.log;

if(typeof(jQuery)!='undefined'){
    (function( $ ){
	$.fn.serializeJSON=function() {
	    var json = {};
	    jQuery.map($(this).serializeArray(), function(n, i){
		json[n['name']] = n['value'];
	    });
	    return json;
	};
    })( jQuery );
}

Object.defineProperty(Object.prototype, 'descend', {
    value: function(){
	var keys = arguments;
	var cur = this;
	for(var i=0; i<keys.length; i++){
	    var key = keys[i];
	    var cur = cur[key];
	    if(typeof(cur)=='undefined')
		return cur;
	}
	return cur;
    }
});



getTime = null;
(function(exports){
    exports.filterObject = function(obj, props){
	var out = {};
	for(var i in obj){
	    if(exports.in_array(i, props)){
		out[i] = obj[i];
	    }
	}
	return out;
    }

    exports.urlFix = function(url){
	var url = utils.str_replace('?', '%3F', url);
	return url;
    }

    exports.GetRFC822Date = function(oDate)
    {
	var aMonths = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", 
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    
	var aDays = new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
	var dtm = new String();
	
	dtm = aDays[oDate.getDay()] + ", ";
	dtm += padWithZero(oDate.getDate()) + " ";
	dtm += aMonths[oDate.getMonth()] + " ";
	dtm += oDate.getFullYear() + " ";
	dtm += padWithZero(oDate.getHours()) + ":";
	dtm += padWithZero(oDate.getMinutes()) + ":";
	dtm += padWithZero(oDate.getSeconds()) + " " ;
	dtm += getTZOString(oDate.getTimezoneOffset());
	return dtm;
    }
  //Pads numbers with a preceding 0 if the number is less than 10.
    function padWithZero(val)
    {
	if (parseInt(val) < 10)
	{
	    return "0" + val;
	}
	return val;
    }

  /* accepts the client's time zone offset from GMT in minutes as a parameter.
  returns the timezone offset in the format [+|-}DDDD */
    function getTZOString(timezoneOffset)
    {
	var hours = Math.floor(timezoneOffset/60);
	var modMin = Math.abs(timezoneOffset%60);
	var s = new String();
	s += (hours > 0) ? "-" : "+";
	var absHours = Math.abs(hours)
	s += (absHours < 10) ? "0" + absHours :absHours;
	s += ((modMin == 0) ? "00" : modMin);
	return(s);
    }


    exports.repeatStr = function(str, count){
	var out = '';
	for(var i = 0; i<count; i++){
	    out+= str;
	}
	return out;
    }

    exports.randomString = function(string_length, chars) {
	if(!chars)
	    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	if(!string_length)
	    var string_length = 8;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
	    var rnum = Math.floor(Math.random() * chars.length);
	    randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
    }


    exports.last = function(obj){
	var out = obj;
	for(var i in obj){
	    out = obj[i];
	}
	return out;
    }

    exports.fork = function(fun){
	setTimeout(fun, 1);
    }

    exports.getTime = function(){
	var date = new Date();
	return date.getTime()/1000;
    }
    getTime = exports.getTime;//shortcut
    exports.beginsWith = function(needle, haystack){
	if(haystack.substr(0, needle.length) == needle){
	    return true;
	}
	return false;
    }
    //adjusts a value up or down to nearest int with a random factor
    //based upon the decimal value. i.e. 3.2 has a 80% chance of being 3, 20% of 4
    exports.randRound = function(num){
	var num = Number(num);
	var floor = Math.floor(num);
	var dec = num - floor;
	if(Math.random()>dec){
	    return floor;
	}
	return Math.ceil(num);
    }

    /*
    Example array for callback stack
	var add_vision_stack = [
	    {collection:'ship', query:ship_query, fields:fields, f:addToVision},
	    {collection:'port', query:query, f:addToVision},
	    {collection:'cannon_shot', query:query, f:addToVision},
	    {f:next, no_params:true}
	}
    addToVision takes in (params [object], callback [function])
    callback is used to execute the next element in the stack.
*/
    exports.callbackStack = function(stack){
	var params = stack.shift();
	if(!params)
	    return;
	if(params.no_params){
	    params.f();
	}else{
	    params.f(params, function(){exports.callbackStack(stack)});
	}
    }

    exports.forceZero = function(val){
	if(!val)
	    return 0;
	val =  Number(val);
	if(!val) 
	    val = 0;
	return val;
    }
    
    exports.number_format = function(number, decimals, dec_point, thousands_sep){
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
    }


    exports.sortArrayOfObjectsByField = function(arr, field, field_modifier, desc){
	function sorter(a, b) {
	    if(desc){
		var c = a;
		a = b;
		b = c;
	    }
	    if(field_modifier){
		return field_modifier(a[field]) - field_modifier(b[field]);
	    }
	    return a[field] - b[field];
	}
	return arr.sort(sorter);
    }


    exports.max = function(arr){
	var out = null;
	for(var i in arr){
	    if((out==null)||(out<arr[i])){
		out = arr[i];
	    }
	}
	return out;
    }
    exports.min = function(arr){
	var out = null;
	for(var i in arr){
	    if((out==null)||(out>arr[i])){
		out = arr[i];
	    }
	}
	return out;
    }
    
    exports.count = function(set){
	var c = 0;
	for(var i in set){
	    c++;
	}
	return c;
    }
    exports.shuffle = function(o){
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
    }
    exports.cloneObject = function(obj){
	if(!obj)
	    return obj;
	var clone = {};
	for(var i in obj) {
            if(typeof(obj[i])=="object")
		clone[i] = exports.cloneObject(obj[i]);
            else
                clone[i] = obj[i];
	}
	return clone;
    }


    exports.ucwords  = function(str) {
	return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
            return $1.toUpperCase();
	});
    }

    exports.timeAgo =  function(timestamp){
	var time = getTime()-Number(timestamp);
	var intervals = [
	    {label:'day', seconds:24*60*60},
	    {label:'hr', seconds:60*60},
	    {label:'min', seconds:60},
	    {label:'sec', seconds:1}
	];
	var c = 0;
	var out = '';
	for(var i in intervals){ 
	    var inv = intervals[i];
	    if(time>inv.seconds){
		c++;
		var amt = Math.floor(time/inv.seconds);
		var time = time - (amt*inv.seconds);
		out+= ' '+amt+' '+inv.label;
	    }
	}
	return out;
    }


    exports.str_replace = function(search, replace, subject, count) {
	var i = 0, j = 0, temp = '', repl = '', sl = 0, fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = r instanceof Array, sa = s instanceof Array;
	s = [].concat(s);
	if (count) {
            this.window[count] = 0;
	}

	for (i=0, sl=s.length; i < sl; i++) {
            if (s[i] === '') {
		continue;
            }
            for (j=0, fl=f.length; j < fl; j++) {
		temp = s[i]+'';
		repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
		s[i] = (temp).split(f[j]).join(repl);
		if (count && s[i] !== temp) {
                    this.window[count] += (temp.length-s[i].length)/f[j].length;}
            }
	}
	return sa ? s : s[0];
    }

    exports.first = function(thing){
	if(!thing)
	    return null;
	for(var i in thing)
	    return thing[i];
	return null;
    }
    exports.explode = function (delimiter, string, limit) {
	var emptyArray = {
            0: ''
	};	
	// third argument is not required
	if (arguments.length < 2 || typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined') {
            return null;
	}
	
	if (delimiter === '' || delimiter === false || delimiter === null) {
            return false;
	}
	
	if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string == 'object') {
            return emptyArray;
	}
	
	if (delimiter === true) {
            delimiter = '1';
	}
	
	if (!limit) {
            return string.toString().split(delimiter.toString());
	} else {
            // support for limit argument
            var splitted = string.toString().split(delimiter.toString());
            var partA = splitted.splice(0, limit - 1);
            var partB = splitted.join(delimiter.toString());
            partA.push(partB);
            return partA;
	}
    }

    exports.pretty = function(str){
	return exports.ucwords(exports.str_replace('_', ' ', str));
    }
    exports.explode = function(delimiter, string, limit) {
	var emptyArray = {
            0: ''
	};
	// third argument is not required
	if (arguments.length < 2 || typeof arguments[0] == 'undefined' || typeof arguments[1] == 'undefined') {
            return null;
	}
	if (delimiter === '' || delimiter === false || delimiter === null) {
            return false;
	}
	if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string == 'object') {
            return emptyArray;
	}
	if (delimiter === true) {
            delimiter = '1';
	}
	if (!limit) {
            return string.toString().split(delimiter.toString());
	} else {
            // support for limit argument
            var splitted = string.toString().split(delimiter.toString());
            var partA = splitted.splice(0, limit - 1);
            var partB = splitted.join(delimiter.toString());
            partA.push(partB);
            return partA;
	}
    }

    exports.randInt = function(min, max){
	var argc = arguments.length;
	if (argc === 0) {
            min = 0;
            max = 2147483647;
	} else if (argc === 1) {
            throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if(typeof(serverStarted)=='undefined')
	var serverStarted = exports.getTime();
    exports.killIfEdited = function(pathToFile){
	fs.stat(pathToFile, function(err, stats){
	    if(!stats)
		return console.log(err);
	    
	    modified = stats.mtime.getTime()/1000;
	    
	    if(modified>serverStarted){
		console.log(pathToFile+' edited, shutting down')
		process.exit(1);
	    }
	});
    }
    exports.in_array = function(needle, haystack, argStrict) {
	var key = '',
        strict = !! argStrict;
	if (strict) {
            for (key in haystack) {
		if (haystack[key] === needle) {
                    return true;
		}
            }
	} else {
            for (key in haystack) {
		if (haystack[key] == needle) {
                    return true;
		}
            }
	}
	return false;
    }
    exports.is_array = function(input){
	return typeof(input)=='object'&&(input instanceof Array);
    }

    exports.is_substr = function(needle, haystack){
	if(needle){
	    pos = exports.strpos(haystack, needle);
	}
	if(pos===false){
	    return false;
	} 
	return true;
    }
    exports.isSubstr = exports.is_substr;

    exports.strpos = function(haystack, needle, offset){
	var i = (haystack + '').indexOf(needle, (offset || 0));
	return i === -1 ? false : i;
    }

    exports.is_numeric = function(mixed_var){
	return (typeof(mixed_var) === 'number' || typeof(mixed_var) === 'string') && mixed_var !== '' && !isNaN(mixed_var);
    }

    exports.sum = function(obj){
	var out = 0;
	for(var i in obj){
	    var a = obj[i];
	    if(exports.is_numeric(a)){
		var a = parseFloat(a);
		out = out + a;
	    }
	}
	return out;
    }
    

    exports.xyToAngle = function(x, y){
	var angle = Math.atan(y/x);
	angle = exports.radiansToDegrees(angle);
	if((x >= 0)){
            return angle + 90;
	}
	return angle + 270;
    }

    exports.radiansToDegrees =function(rad){
	var deg = rad * (180/Math.PI)
	return deg;
    }

    exports.degreesToRadians = function(deg)
    {
	var rad = deg * Math.PI / 180;
	return rad;
    }

    exports.roundedAngle = function(angle, increment){
	angle = exports.cleanupAngle(angle);
	var slices = 360/increment;
	var rounded = (Math.round((angle/360)*slices)/slices)*360;
	if(rounded==360)
	    rounded = 0;
	return rounded;
    }

    exports.cleanupAngle = function(angle){
	var angle = Number(angle);
	if(!angle)
	    angle = 0;
	if(angle<0)
	    angle = angle+360;
	angle = angle%360;
	if(angle==360)
	    angle = 0;
	return angle;
    }

    exports.distance = function(x1, y1, x2, y2, loop_x){
	var x = x2 - x1;
	var y = y2 - y1;
	var d1 = Math.sqrt(x*x + y*y);
	if(loop_x){
	    var d2 = exports.distance(x1+loop_x, y1, x2, y2);
	    if(d2<d1)
		return d2;
	    d2 = exports.distance(x1-loop_x, y1, x2, y2);
	    if(d2<d1)
		return d2;
	}

	return d1;
    }

    //moveTo along angle
    exports.angleToXY = function(angle, dist, obj){
	if(!obj){
	    obj.x = 0;
	    obj.y = 0;
	}
	angle = exports.degreesToRadians(angle-90);
	var x = Math.cos(angle)*dist;
	var y = Math.sin(angle)*dist;
	obj.x = obj.x + x;
	obj.y = obj.y + y;
	return obj;
    }

    exports.angleDifference = function(a1, a2){
	a1 = exports.cleanupAngle(a1);
	a2 = exports.cleanupAngle(a2);
	a1 = a1+(360*2);//make larger to keep positive
	a2 = a2+(360*2);
	choices = [Math.abs(a1-a2), Math.abs(a2-a1), Math.abs((a1+360)-a2), Math.abs((a2+360)-a1)];
	var min = 360;
	for(var i=0; i<choices.length; i++){
	    if(choices[i]<min)
		min = choices[i];
	}
	return exports.cleanupAngle(min);
    }
    
    exports.md5 = function(str){
	var xl;

	var rotateLeft = function (lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	};

	var addUnsigned = function (lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
		return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
		if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
		} else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
		}
            } else {
		return (lResult ^ lX8 ^ lY8);
            }
	};

	var _F = function (x, y, z) {
            return (x & y) | ((~x) & z);
	};
	var _G = function (x, y, z) {
            return (x & z) | (y & (~z));
	};
	var _H = function (x, y, z) {
            return (x ^ y ^ z);
	};
	var _I = function (x, y, z) {
            return (y ^ (x | (~z)));
	};

	var _FF = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
	};

	var _GG = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
	};

	var _HH = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
	};

	var _II = function (a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
	};

	var convertToWordArray = function (str) {
            var lWordCount;
            var lMessageLength = str.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = new Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
		lWordCount = (lByteCount - (lByteCount % 4)) / 4;
		lBytePosition = (lByteCount % 4) * 8;
		lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
		lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
	};

	var wordToHex = function (lValue) {
            var wordToHexValue = "",
            wordToHexValue_temp = "",
            lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
		lByte = (lValue >>> (lCount * 8)) & 255;
		wordToHexValue_temp = "0" + lByte.toString(16);
		wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
            }
            return wordToHexValue;
	};

	var x = [],
        k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21;

	str = exports.utf8_encode(str);
	x = convertToWordArray(str);
	a = 0x67452301;
	b = 0xEFCDAB89;
	c = 0x98BADCFE;
	d = 0x10325476;

	xl = x.length;
	for (k = 0; k < xl; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
	}

	var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

	return temp.toLowerCase();
    }

    exports.utf8_encode = function(argString){
	if (argString === null || typeof argString === "undefined") {
            return "";
	}
 
	var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	var utftext = "",
        start, end, stringl = 0;
 
	start = end = 0;
	stringl = string.length;
	for (var n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;
 
            if (c1 < 128) {
		end++;
            } else if (c1 > 127 && c1 < 2048) {
		enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
            } else {
		enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
            }
            if (enc !== null) {
		if (end > start) {
                    utftext += string.slice(start, end);
		}
		utftext += enc;
		start = end = n + 1;
            }
	}
 
	if (end > start) {
            utftext += string.slice(start, stringl);
	}
 
	return utftext;

    }


})(typeof exports === 'undefined'? this['utils']={}: exports);