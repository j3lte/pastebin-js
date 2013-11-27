var _ = require('underscore'),
    fs = require('fs'),
    xml2js = require('xml2js'),

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
Pastebin.prototype.getPaste = function (id, callback) {
  if (!callback || typeof callback !== 'function')
    throw new Error('[-] getPaste : No callback provided');
  if (!id)
    throw new Error('[-] getPaste : No paste id given!');
  console.log(this.config);
  var getUrl = conf.net.protocol + conf.net.base + conf.net.endpoint.raw + id;
  method.get(getUrl,null,function (err, data) {
    if (err) {
      callback(err,null);
    } else {
      callback(null, data);
    }
  });
};

/**
 * Create a paste!
 */
Pastebin.prototype.createPaste = function (text, title, format, privacy, expiration, callback) {
  var self = this,
      p = {},
      optional = {};

  if (typeof text !== 'string') {
    throw new Error("Error! Paste can only be a text!");
    return false;
  }
  p.api_option = 'paste';
  p.api_dev_key = self.config.api_dev_key;
  p.api_paste_code = text;

  if (typeof title !== 'undefined' && title !== null)
    p.api_paste_name = title;

  if (typeof format !== 'undefined' && format !== null) {
    var formats = conf.formats;
    if (formats[format]) {
      p.api_paste_format = format;
    } else {
      throw new Error("Error! Paste format " + format + " is unknown.");
      return false;
    }
  }

  if (typeof privacy !== 'undefined' && privacy !== null) {
    if (privacy === 0 || privacy === 1) {
      p.api_paste_private = privacy
    } else if (privacy === 2) {
      if (self.config.api_user_key) {
        p.api_user_key = self.config.api_user_key;
      } else if (self.config.api_user_name !== null && self.config.api_user_password !== null) {
        self.createAPIuserKey(function () {
          self.createPaste(text, title, format, privacy, expiration, callback);
        });
        return false;
      } else {
        throw new Error("Error! For this privacy level you need to be logged in! Provide username and password!");
        return false;
      }
    } else {
      throw new Error("Error! Privacy level is unknown!");
      return false;
    }
  }

  if (typeof expiration !== 'undefined' && expiration !== null) {
    var expirations = conf.expiration;
    if (expirations[expiration]) {
      p.api_paste_expire_date = expiration;
    } else {
      throw new Error("Error! Paste expiration " + expiration + " is unknown.");
      return false;
    }
  }

  this._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, p, function (err, data) {
    if (err) {
      console.log("Error in createPaste! " + err);
    } else {
      if (!callback)
        callback = function (data) { console.log(data); }

      callback(data);
    }
  });

};

/**
 * Create a paste from file
 */
Pastebin.prototype.createPasteFromFile = function (filename, title, format, privacy, expiration, callback) {
  var self = this;
  if (!filename) {
    throw new Error("Filename not provided!");
    return false;
  }
  fs.readFile(filename, "UTF8", function (err, data) {
    if (err) {
      throw err;
      return false;
    }
    self.createPaste(data, title, format, privacy, expiration, callback);
  })
};

/**
 * Create userkey. Saved in config.api_user_key
 */
Pastebin.prototype.createAPIuserKey = function (callback) {
  var self = this,
      params = self._getRequired(['api_dev_key','api_user_name','api_user_password']);
  this._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.login, params, function (err, data) {
    if (err) {
      console.log("Error in createAPIuserkey! " + err);
    } else if (data.length !== 32) {
      console.log("Error in createAPIuserkey! " + data);
    } else {
      self.config.api_user_key = data;
      if (callback)
          callback();
    }
  })
};

/**
 * Lists the user pastes
 */
Pastebin.prototype.listUserPastes = function (limit, callback) {
  var self = this,
      params = {},
      limit = limit || 50;

  if (typeof limit === 'function' && !callback) {
    callback = limit;
    limit = 50;
  }

  if (!self.config.api_user_key) {
    self.createAPIuserKey(function () {
      self.listUserPastes(limit,callback);
    });
  } else {

    params.api_dev_key = self.config.api_dev_key;
    params.api_user_key = self.config.api_user_key;
    params.api_results_limit = limit || 50;
    params.api_option = 'list';

    this._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params, function (err, data) {
      if (err) {
        console.log("Error in listUserPastes! " + err);
      } else {
        if (!callback) {
          callback = function (data) {
            console.log(JSON.stringify(data,null,4));
          }
        }
        self._parsePastes(data, callback);
      }
    });

  }
};

/**
 * Lists the trending pastes
 */
Pastebin.prototype.listTrendingPastes = function (callback) {
  var self = this,
      params = {};

  params.api_option = 'trends';
  params.api_dev_key = self.config.api_dev_key;

  this._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params, function (err, data) {
    if (err) {
      console.log("Error in listTrendingPastes! " + err);
    } else {
      if (!callback) {
        callback = function (data) {
          console.log(JSON.stringify(data,null,4));
        }
      }
      self._parsePastes(data, callback);
    }
  });

};

/**
 * Gets the info of the user
 */
Pastebin.prototype.getUserInfo = function (callback) {
  var self = this,
      params = {};

  params.api_option = 'userdetails';
  params.api_dev_key = self.config.api_dev_key;

  if (!self.config.api_user_key) {
    self.createAPIuserKey(function () {
      self.getUserInfo(callback);
    });
  } else {
    params.api_user_key = self.config.api_user_key;
    this._postApi(conf.net.protocol + conf.net.base + conf.net.endpoint.post, params, function (err, data) {
      if (err) {
        console.log("Error in getUserInfo! " + err);
      } else {
        if (!callback) {
          callback = function (data) {
            console.log(JSON.stringify(data,null,4));
          }
        }
        self._parseUser(data, callback);
      }
    });
  }
};

/**
 * Parse an XML file containing pastes
 */
Pastebin.prototype._parsePastes = function (xml, callback) {
  this._parseXML(xml, function (err,data) {
    if (data) {
      var rootObj = data["paste"];
      var normalize = _.map(rootObj, function (paste) {
        var obj = {};
        _.map(_.keys(paste), function (key) {
          obj[key] = paste[key][0];
        });
        return obj;
      });
      callback(normalize);
    } else {
      callback(undefined);
    }
  });
};

/**
 * Parse an XML file containing userdata
 */
Pastebin.prototype._parseUser = function (xml, callback) {
  this._parseXML(xml, function (err,data) {
    if (data) {
      var rootObj = data["user"][0];
      var normalize = {};
      _.each(Object.keys(rootObj), function (key) {
        normalize[key] = rootObj[key][0];
      })
      callback(normalize);
    } else {
      callback(undefined);
    }
  });
};

/**
 * Parse an XML file
 */
Pastebin.prototype._parseXML = function (xml, callback) {
  if (!xml)
    throw new Error('No xml provided!');
  if (!callback)
    throw new Error('No callback provided!');

  var xmlString = "<root>\n";
      xmlString += xml;
      xmlString += "</root>\n";

  var parser = new xml2js.Parser({
    "trim" : true,
    "explicitRoot" : false
  })
  parser.parseString(xmlString, function (err, data) {
      if (err) {
        console.log(err);
        callback(err);
      } else {
        callback(null,data);
      }
  })
};

/**
 * Returns a list with the required parameters from config
 */
Pastebin.prototype._getRequired = function (paramlist) {
  var self = this,
      ret = {};
  ret = _.pick(self.config, paramlist);
  if (Object.keys(ret).length !== paramlist.length) {
    throw new Error('Missing parameters! ' + _.difference(paramlist,Object.keys(ret)));
  } else {
    return ret;
  }
};

/**
 * Higher lever method for get requests
 */
Pastebin.prototype._getApi = function (path, params, callback) {
  method.get(path,params,callback);
};

/**
 * Higher level method for post requests
 */
Pastebin.prototype._postApi = function (path, params, callback) {
  method.post(path,params,callback);
};


module.exports = Pastebin;


