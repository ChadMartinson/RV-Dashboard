/* */ 
var async = require("async");
var Config = require("bower-config");
var methods = require("./lib/index");
var Cache = require("./lib/util/Cache");
function RegistryClient(config, logger) {
  this._logger = logger;
  this._config = Config.normalise(config);
  if (!Object.prototype.hasOwnProperty.call(this._config, 'cache')) {
    this._config.cache = this._config.storage ? this._config.storage.registry : null;
  }
  this._initCache();
}
RegistryClient.prototype.lookup = methods.lookup;
RegistryClient.prototype.search = methods.search;
RegistryClient.prototype.list = methods.list;
RegistryClient.prototype.register = methods.register;
RegistryClient.prototype.clearCache = function(name, callback) {
  if (typeof name === 'function') {
    callback = name;
    name = null;
  }
  async.parallel([this.lookup.clearCache.bind(this, name), this.search.clearCache.bind(this, name), this.list.clearCache.bind(this)], callback);
};
RegistryClient.prototype.resetCache = function(name) {
  this.lookup.resetCache.call(this, name);
  this.search.resetCache.call(this, name);
  this.list.resetCache.call(this);
  return this;
};
RegistryClient.clearRuntimeCache = function() {
  Cache.clearRuntimeCache();
};
RegistryClient.prototype._initCache = function() {
  var cache;
  var dir = this._config.cache;
  cache = this.constructor._cache = this.constructor._cache || {};
  this._cache = cache[dir] = cache[dir] || {};
  this.lookup.initCache.call(this);
  this.search.initCache.call(this);
  this.list.initCache.call(this);
};
module.exports = RegistryClient;
