var request = require('request'),
    TIMEOUT = 4000,
    HEADERS = { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
        'Cache-Control:' : 'no-cache'
    };

var methods = module.exports = {
  get : function (path, params, callback) {
    if (!path)
        throw new Error ('No path provided');
    if ((typeof params === 'function') && !callback) {
        callback = params;
        params = {};
    }
    request({
        uri : path,
        qs : params,
        method : "GET",
        headers : HEADERS,
        timeout : TIMEOUT,
        followRedirect : true
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            callback({status : response.statusCode, error : error}, null);
        } else {
            callback(null, body);
        }
    });
  },
  post : function (path, params, callback) {
    if (!path)
        throw new Error ('No path provided');
    if ((typeof params === 'function') && !callback) {
        callback = params;
        params = {};
    }
    request({
        uri : path,
        method : "POST",
        form : params,
        headers : HEADERS,
        timeout : TIMEOUT,
        followRedirect : true
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            callback({status : response.statusCode, error : error}, null);
        } else {
            callback(null, body);
        }
    });
  }
}