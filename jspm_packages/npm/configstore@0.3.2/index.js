/* */ 
(function(process) {
  'use strict';
  var path = require("path");
  var os = require("os");
  var fs = require("graceful-fs");
  var osenv = require("osenv");
  var userHome = require("user-home");
  var assign = require("object-assign");
  var mkdirp = require("mkdirp");
  var yaml = require("js-yaml");
  var uuid = require("uuid");
  var xdgBasedir = require("xdg-basedir");
  var tempdir = os.tmpdir || os.tmpDir;
  var user = (osenv.user() || uuid.v4()).replace(/\\/g, '');
  var configDir = xdgBasedir.config || path.join(tempdir(), user, '.config');
  var permissionError = 'You don\'t have access to this file.';
  var defaultPathMode = parseInt('0700', 8);
  var writeFileOptions = {mode: parseInt('0600', 8)};
  if (/^v0\.8\./.test(process.version)) {
    writeFileOptions = undefined;
  }
  function Configstore(id, defaults) {
    this.path = path.join(configDir, 'configstore', id + '.yml');
    this.all = assign({}, defaults || {}, this.all || {});
  }
  Configstore.prototype = Object.create(Object.prototype, {
    all: {
      get: function() {
        try {
          return yaml.safeLoad(fs.readFileSync(this.path, 'utf8'), {
            filename: this.path,
            schema: yaml.JSON_SCHEMA
          });
        } catch (err) {
          if (err.code === 'ENOENT') {
            mkdirp.sync(path.dirname(this.path), defaultPathMode);
            return {};
          }
          if (err.code === 'EACCES') {
            err.message = err.message + '\n' + permissionError + '\n';
          }
          if (err.name === 'YAMLException') {
            fs.writeFileSync(this.path, '', writeFileOptions);
            return {};
          }
          throw err;
        }
      },
      set: function(val) {
        try {
          mkdirp.sync(path.dirname(this.path), defaultPathMode);
          fs.writeFileSync(this.path, yaml.safeDump(val, {
            skipInvalid: true,
            schema: yaml.JSON_SCHEMA
          }), writeFileOptions);
        } catch (err) {
          if (err.code === 'EACCES') {
            err.message = err.message + '\n' + permissionError + '\n';
          }
          throw err;
        }
      }
    },
    size: {get: function() {
        return Object.keys(this.all || {}).length;
      }}
  });
  Configstore.prototype.get = function(key) {
    return this.all[key];
  };
  Configstore.prototype.set = function(key, val) {
    var config = this.all;
    config[key] = val;
    this.all = config;
  };
  Configstore.prototype.del = function(key) {
    var config = this.all;
    delete config[key];
    this.all = config;
  };
  module.exports = Configstore;
})(require("process"));
