var request = require('request'),
    config = require('./config'),
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

        if (!path) {
            deferred.reject(new Error('No path provided'));
        }
        if (!params) {
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
            var status = response.statusCode;
            if (error) {
                deferred.reject({status : status, error : error});
            }
            if (status === 404) {
                deferred.reject(new Error("Error 404, paste not found!"));
            }
            if (status !== 200) {
                deferred.reject(new Error("Unknown error, status: " + status));
            }
            if (body.length === 0) {
                deferred.reject(new Error("Empty response"));
            }
            if (body.indexOf("Bad API request") !== -1) {
                deferred.reject(new Error("Error: " + body));
            }
            deferred.resolve(body);
        });

        return deferred.promise;
    },
    post : function (path, params, callback) {
        var _this = this,
            deferred = Q.defer();

        if (!path) {
            deferred.reject(new Error('No path provided'));
        }
        if (!params) {
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
            var status = response.statusCode;
            if (error) {
                deferred.reject({status : status, error : error});
            }
            if (status !== 200) {
                deferred.reject(new Error("Unknown error, status: " + status));
            }
            if (body.length === 0) {
                deferred.reject(new Error("Empty response"));
            }
            if (body.indexOf("Bad API request") !== -1) {
                deferred.reject(new Error("Error: " + body));
            }
            deferred.resolve(body);
        });

        return deferred.promise;
    }
};
