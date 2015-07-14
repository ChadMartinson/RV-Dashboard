/* */ 
(function(process) {
  var lang = require("mout/lang");
  var object = require("mout/object");
  var rc = require("./util/rc");
  var defaults = require("./util/defaults");
  var expand = require("./util/expand");
  var path = require("path");
  function Config(cwd) {
    this._cwd = cwd || process.cwd();
    this._config = {};
  }
  Config.prototype.load = function() {
    this._config = rc('bower', defaults, this._cwd);
    return this;
  };
  Config.prototype.get = function(key) {};
  Config.prototype.set = function(key, value) {
    return this;
  };
  Config.prototype.del = function(key, value) {
    return this;
  };
  Config.prototype.save = function(where, callback) {};
  Config.prototype.toObject = function() {
    var config = lang.deepClone(this._config);
    config = Config.normalise(config);
    return config;
  };
  Config.create = function(cwd) {
    return new Config(cwd);
  };
  Config.read = function(cwd) {
    var config = new Config(cwd);
    return config.load().toObject();
  };
  Config.normalise = function(rawConfig) {
    var config = {};
    object.deepMixIn(config, expand(defaults), expand(rawConfig));
    config.shorthandResolver = config.shorthandResolver.replace(/\{\{\{/g, '{{').replace(/\}\}\}/g, '}}');
    config.registry.search = config.registry.search.map(function(url) {
      return url.replace(/\/+$/, '');
    });
    config.registry.register = config.registry.register.replace(/\/+$/, '');
    config.registry.publish = config.registry.publish.replace(/\/+$/, '');
    config.tmp = path.resolve(config.tmp);
    return config;
  };
  Config.DEFAULT_REGISTRY = defaults.registry;
  module.exports = Config;
})(require("process"));
