var _ = require('underscore'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    Q = require('Q');

    method = require('../lib/methods'),
    conf = require('../lib/config');

/**
 * Pastebin constructor
 */
function Pastebin (config) {
  // Pastebin('userkey')
  if (typeof config === 'string')
    config = { api_dev_key : config };

  this.config = _.extend(conf.defaults, config);

  return this;
}

/**
 * Get a paste
 */
Pastebin.prototype.getPaste = function (id) {
  var _this = this,
      deferred = Q.defer();

  if (!id)
    deferred.reject(new Error('[-] getPaste : No paste id given!'));

  var getUrl = conf.net.protocol + conf.net.base + conf.net.endpoint.raw + id;

  method
    .get(getUrl,null)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Create a paste!
 */
Pastebin.prototype.createPaste = function (text, title, format, privacy, expiration) {
  var _this = this,
      deferred = Q.defer(),
      p = {},
      optional = {};

  if (typeof text !== 'string')
    deferred.reject(new Error("Error! Paste can only be a text!"));

  p.api_option = 'paste';
  p.api_dev_key = _this.config.api_dev_key;
  p.api_paste_code = text;

  if (typeof title !== 'undefined' && title !== null)
    p.api_paste_name = title;

  if (typeof format !== 'undefined' && format !== null) {
    var formats = conf.formats;
    if (formats[format]) {
      p.api_paste_format = format;
    } else {
      deferred.reject(new Error("Error! Paste format " + format + " is unknown."));
    }
  }

  if (typeof privacy !== 'undefined' && privacy !== null) {
    if (privacy === 0 || privacy === 1) {
      p.api_paste_private = privacy
    } else if (privacy === 2) {
      if (_this.config.api_user_key) {
        p.api_user_key = _this.config.api_user_key;
      } else if (_this.config.api_user_name !== null && _this.config.api_user_password !== null) {
        _this
          .createAPIuserKey()
          .then(function () {
            _this
              .createPaste(text, title, format, privacy, expiration)
              .then(deferred.resolve)
              .fail(deferred.reject);
          });
      } else {
        deferred.reject(new Error("Error! For this privacy level you need to be logged in! Provide username and password!"));
      }
    } else {
      deferred.reject(new Error("Error! Privacy level is unknown!"));
    }
  }

  if (typeof expiration !== 'undefined' && expiration !== null) {
    var expirations = conf.expiration;
    if (expirations[expiration]) {
      p.api_paste_expire_date = expiration;
    } else {
      deferred.reject(new Error("Error! Paste expiration " + expiration + " is unknown."));
    }
  }

  _this
    ._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, p)
      .then(function (data) {
        deferred.resolve(data);
      })
      .fail(deferred.reject);

  return deferred.promise;

};

/**
 * Create a paste from file
 */
Pastebin.prototype.createPasteFromFile = function (filename, title, format, privacy, expiration) {
  var _this = this,
      deferred = Q.defer();

  if (!filename)
    deferred.reject(new Error("Filename not provided!"));

  fs.readFile(filename, "UTF8", function (err, data) {
    if (err)
      deferred.reject(new Error("Readfile error: " + err));

    _this
      .createPaste(data, title, format, privacy, expiration)
      .then(deferred.resolve)
      .fail(deferred.reject);

  });

  return deferred.promise;
};

/**
 * Create userkey. Saved in config.api_user_key
 */
Pastebin.prototype.createAPIuserKey = function () {
  var _this = this,
      deferred = Q.defer();

  _this
    ._getRequired(['api_dev_key','api_user_name','api_user_password'])
    .then(function (params) {
      _this
        ._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.login, params)
        .then(function (data) {
          if (data.length !== 32){
            deferred.reject(new Error("Error in createAPIuserKey! " + data));
          } else {
            _this.config.api_user_key = data;
            deferred.resolve(true);
          }
        })
        .fail(deferred.reject);
    })
    .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Lists the user pastes
 */
Pastebin.prototype.listUserPastes = function (limit) {
  var _this = this,
      deferred = Q.defer(),
      params = {},
      limit = limit || 50;

  if (!_this.config.api_user_key) {

    _this
      .createAPIuserKey()
      .then(function () {
        _this
          .listUserPastes(limit)
          .then(deferred.resolve)
          .fail(deferred.reject);
      });

  } else {

    params.api_dev_key = _this.config.api_dev_key;
    params.api_user_key = _this.config.api_user_key;
    params.api_results_limit = limit || 50;
    params.api_option = 'list';

    _this
      ._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params)
      .then(function (data) {
        _this
          ._parsePastes(data)
          .then(deferred.resolve)
          .fail(deferred.reject);
      })
      .fail(deferred.reject);
  }

  return deferred.promise;
};

/**
 * Lists the trending pastes
 */
Pastebin.prototype.listTrendingPastes = function (callback) {
  var _this = this,
      deferred = Q.defer(),
      params = {};

  params.api_option = 'trends';
  params.api_dev_key = _this.config.api_dev_key;

  _this
      ._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params)
      .then(function (data) {
        _this
          ._parsePastes(data)
          .then(deferred.resolve)
          .fail(deferred.reject);
      })
      .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Gets the info of the user
 */
Pastebin.prototype.getUserInfo = function () {
  var _this = this,
      deferred = Q.defer(),
      params = {};

  params.api_option = 'userdetails';
  params.api_dev_key = _this.config.api_dev_key;

  if (!_this.config.api_user_key) {
    _this
      .createAPIuserKey()
      .then(function () {
        _this
          .getUserInfo()
          .then(deferred.resolve)
          .fail(deferred.reject);
      });
  } else {
    params.api_user_key = _this.config.api_user_key;

    _this
      ._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params)
      .then(function (data) {
        _this
          ._parseUser(data)
          .then(deferred.resolve)
          .fail(deferred.reject);
      })
      .fail(deferred.reject);
  }

  return deferred.promise;
};

/**
 * Parse an XML file containing pastes
 */
Pastebin.prototype._parsePastes = function (xml, callback) {
  var _this = this,
      deferred = Q.defer();

  _this
    ._parseXML(xml)
    .then(function (data) {
      if (data) {
        var rootObj = data["paste"],
            normalize = _.map(rootObj, function (paste) {
              var obj = {};
              _.map(_.keys(paste), function (key) {
                obj[key] = paste[key][0];
              });
              return obj;
            });

        deferred.resolve(normalize);
      } else {
        deferred.reject(new Error('No data returned to _parsePastes!'));
      }
    })
    .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Parse an XML file containing userdata
 */
Pastebin.prototype._parseUser = function (xml) {
  var _this = this,
      deferred = Q.defer();

  _this
    ._parseXML(xml)
    .then(function (data) {
      if (data) {
        var rootObj = data["user"][0],
            normalize = {};

        _.each(Object.keys(rootObj), function (key) { normalize[key] = rootObj[key][0]; })

        deferred.resolve(normalize);
      } else {
        deferred.reject(new Error('No data returned to _parseUser!'));
      }
    })
    .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Parse an XML file
 */
Pastebin.prototype._parseXML = function (xml) {
  var _this = this,
      deferred = Q.defer();

  if (!xml)
    deferred.reject(new Error('No xml provided!'));

  var xmlString = "<root>\n";
      xmlString += xml;
      xmlString += "</root>\n";

  var parser = new xml2js.Parser({
    "trim" : true,
    "explicitRoot" : false
  });

  parser.parseString(xmlString, function (err, data) {
      if (err) {
        deferred.reject(new Error("Error in parsing XML: " + err));
      } else {
        deferred.resolve(data);
      }
  });

  return deferred.promise;
};

/**
 * Returns a list with the required parameters from config
 *
 * TODO: Rewrite! Needs to make sure it is checking correctly
 */
Pastebin.prototype._getRequired = function (paramlist) {
  var _this = this,
      deferred = Q.defer(),
      ret = {};

  ret = _.pick(_this.config, paramlist);

  if (Object.keys(ret).length !== paramlist.length) {
    deferred.reject(new Error('Missing parameters! ' + _.difference(paramlist,Object.keys(ret))));
  } else {
    deferred.resolve(ret);
  }

  return deferred.promise;
};

/**
 * Higher lever method for get requests
 */
Pastebin.prototype._getApi = function (path, params) {
  var deferred = Q.defer();

  method
    .get(path,params)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};

/**
 * Higher level method for post requests
 */
Pastebin.prototype._postApi = function (path, params) {
  var deferred = Q.defer();

  method
    .post(path,params)
    .then(deferred.resolve)
    .fail(deferred.reject);

  return deferred.promise;
};


module.exports = Pastebin;


