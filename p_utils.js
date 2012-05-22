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
    els.each(function(el){
	if(el)
	    vals.path.push(els);
    });
    vals.body = req.body;
    vals.query = req.query;
    vals.sub = {};
    var request_order = [
	vals.query, 
	vals.body,
	req.session
    ];//each overrides the previous
    request_order.each(function(r){
	if(r){
	    r.each(function(val, j){
		vals.sub[j] = r[j];
	    });
	}
    });
    vals.config = config;
    req.vals = vals;
    req.vals.vals = req.vals;
    req.sub = req.vals.sub;
    next();
}


