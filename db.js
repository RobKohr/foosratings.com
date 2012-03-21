var server = new mongodb.Server("127.0.0.1", 27017, {});
var client = null;
var collections = {};
exports.connected = false;
//initialize mongo connection

var db = null;
exports.init = function(db_name){
    db = new mongodb.Db(db_name, server, {}).open(function (error, l_client) {
	client = l_client;//make client global
	var collections = {}
	if (error){
	    return console.log(error);
	}
	console.log('success');
	
	exports.collection = function(name){
	    if(!collections[name]){
		collections[name] = new mongodb.Collection(client, name);
	    }
	    if(!collections[name])
		log('couldnt find collection '+name);
	    return collections[name];
	}
	exports.c = exports.collection;//shorthand
	
	exports.connected = true;
    });

}

ObjectID = mongodb.BSONPure.ObjectID;
exports.ObjectID = ObjectID;
//helpers to deal with dock ids.
//obj defaults to origin
docId = function(id){
    if(!id)
	return null;
    if(typeof(id) == 'object'){
	//if you actually passed in an obj with an id
	if(id._id)
	    return docId(id._id); 
	return id;	
    }
    if(id.length != 12 && id.length != 24)
	return null;

    //typical case
    var o =  new ObjectID(id);
    return o;
}

docIdStr = function(id){
    if(!id)
	return null;
    //nothing to do here
    if(typeof(id) != 'object')
	return id;
    //if you passed in an object with an id
    if(id._id)
	return id._id.toHexString();
    //typical case
    if(id.toHexString)
	return id.toHexString();
}

exports.arrayToObject = function(arr){
    var out = {};
    if(!arr)
	return out;
    for(var i in arr){
	out[arr[i]._id] = arr[i];
    }
    return out;
}


//either (x, y, distance) or (obj, distance)
exports.distanceQuery = function(a, b, c){
    if(typeof(a)=='object'){
	var x = a.x;
	var y = a.y
	var d = b;
    }else{
	var x = a;
	var y = b;
	var d = c;
    }
    var query = 
	{x:{$gt:(x-d), $lt:(x+d)}, y:{$gt:(y-d), $lt:(y+d)}};
    return query;
}


