/* */ 
var path = require("path");
var url = require("url");
var async = require("async");
var request = require("request");
var replay = require("request-replay");
var createError = require("./util/createError");
var Cache = require("./util/Cache");
function lookup(name, callback) {
  var data;
  var that = this;
  var registry = this._config.registry.search;
  var total = registry.length;
  var index = 0;
  if (!total) {
    return callback();
  }
  async.doUntil(function(next) {
    var remote = url.parse(registry[index]);
    var lookupCache = that._lookupCache[remote.host];
    if (!that._config.force) {
      lookupCache.get(name, function(err, value) {
        data = value;
        if (err || data || that._config.offline) {
          return next(err);
        }
        doRequest.call(that, name, index, function(err, entry) {
          if (err || !entry) {
            return next(err);
          }
          data = entry;
          lookupCache.set(name, entry, getMaxAge(entry), next);
        });
      });
    } else {
      doRequest.call(that, name, index, function(err, entry) {
        if (err || !entry) {
          return next(err);
        }
        data = entry;
        lookupCache.set(name, entry, getMaxAge(entry), next);
      });
    }
  }, function() {
    return !!data || ++index === total;
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  });
}
function doRequest(name, index, callback) {
  var req;
  var msg;
  var requestUrl = this._config.registry.search[index] + '/packages/' + encodeURIComponent(name);
  var remote = url.parse(requestUrl);
  var headers = {};
  var that = this;
  if (this._config.userAgent) {
    headers['User-Agent'] = this._config.userAgent;
  }
  req = replay(request.get(requestUrl, {
    proxy: remote.protocol === 'https:' ? this._config.httpsProxy : this._config.proxy,
    headers: headers,
    ca: this._config.ca.search[index],
    strictSSL: this._config.strictSsl,
    timeout: this._config.timeout,
    json: true
  }, function(err, response, body) {
    if (err) {
      return callback(createError('Request to ' + requestUrl + ' failed: ' + err.message, err.code));
    }
    if (response.statusCode === 404) {
      return callback();
    }
    if (response.statusCode < 200 || response.statusCode > 299) {
      return callback(createError('Request to ' + requestUrl + ' failed with ' + response.statusCode, 'EINVRES'));
    }
    if (typeof body !== 'object') {
      return callback(createError('Response of request to ' + requestUrl + ' is not a valid json', 'EINVRES'));
    }
    callback(null, {
      type: 'alias',
      url: body.url
    });
  }));
  if (this._logger) {
    req.on('replay', function(replay) {
      msg = 'Request to ' + requestUrl + ' failed with ' + replay.error.code + ', ';
      msg += 'retrying in ' + (replay.delay / 1000).toFixed(1) + 's';
      that._logger.warn('retry', msg);
    });
  }
}
function getMaxAge(entry) {
  if (entry.type === 'alias') {
    return 5 * 24 * 60 * 60 * 1000;
  }
  return 5 * 60 * 60 * 1000;
}
function initCache() {
  this._lookupCache = this._cache.lookup || {};
  this._config.registry.search.forEach(function(registry) {
    var cacheDir;
    var host = url.parse(registry).host;
    if (this._lookupCache[host]) {
      return ;
    }
    if (this._config.cache) {
      cacheDir = path.join(this._config.cache, encodeURIComponent(host), 'lookup');
    }
    this._lookupCache[host] = new Cache(cacheDir, {
      max: 250,
      useStale: this._config.offline
    });
  }, this);
}
function clearCache(name, callback) {
  var lookupCache = this._lookupCache;
  var remotes = Object.keys(lookupCache);
  if (typeof name === 'function') {
    callback = name;
    name = null;
  }
  if (name) {
    async.forEach(remotes, function(remote, next) {
      lookupCache[remote].del(name, next);
    }, callback);
  } else {
    async.forEach(remotes, function(remote, next) {
      lookupCache[remote].clear(next);
    }, callback);
  }
}
function resetCache() {
  var remote;
  for (remote in this._lookupCache) {
    this._lookupCache[remote].reset();
  }
}
lookup.initCache = initCache;
lookup.clearCache = clearCache;
lookup.resetCache = resetCache;
module.exports = lookup;
