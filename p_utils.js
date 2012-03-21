/*private -- server side only utils */
exports.setVals = function(req, res, next){
    var vals = utils.cloneObject(v);

    vals.session = req.session;
    vals.err = [];
    vals.notice = [];
    req.err = vals.err;
    req.notice = vals.notice;
    vals.url = decodeURIComponent(utils.explode('?', req.url)[0]);
    vals.path = [];
    var els = utils.explode('/', vals.url);
    for(var i in els){
	if(els[i])
	    vals.path.push(els[i]);
    }
    vals.body = req.body;
    vals.query = req.query;
    vals.sub = {};
    var request_order = [
	vals.query, 
	vals.body,
	req.session
    ];//each overrides the previous
    for(var i in request_order){
	var r = request_order[i];
	for(var j in r){
	    vals.sub[j] = r[j];
	}	
    }
    vals.config = config;
    req.vals = vals;
    req.vals.vals = req.vals;
    req.sub = req.vals.sub;
    next();
}


