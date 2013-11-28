var request = require('request'),
    Q = require('Q'),
    TIMEOUT = 4000,
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
        'Cache-Control:' : 'no-cache'
    };

var methods = module.exports = {
  get : function (path, params) {
    var _this = this,
        deferred = Q.defer();

    if (!path)
        deferred.reject(new Error('No path provided'));
    if (!params)
        params = {};

    request({
        uri : path,
        qs : params,
        method : "GET",
        headers : HEADERS,
        timeout : TIMEOUT,
        followRedirect : true
    }, function (error, response, body) {
        var status = response.statusCode;
        if (error)
            deferred.reject({status : status, error : error});
        if (status === 404)
            deferred.reject("Error 404, paste not found!");
        if (status !== 200)
            deferred.reject("Unknown error, status: " + status);
        deferred.resolve(body);
    });

    return deferred.promise;
  },
  post : function (path, params, callback) {
    var _this = this,
        deferred = Q.defer();

    if (!path)
        deferred.reject(new Error('No path provided'));
    if (!params)
        params = {};

    request({
        uri : path,
        method : "POST",
        form : params,
        headers : HEADERS,
        timeout : TIMEOUT,
        followRedirect : true
    }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            deferred.reject({status : response.statusCode, error : error});
        } else {
            deferred.resolve(body);
        }
    });

    return deferred.promise;
  }
}
