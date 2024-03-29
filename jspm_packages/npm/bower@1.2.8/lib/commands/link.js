/* */ 
(function(process) {
  var path = require("path");
  var rimraf = require("rimraf");
  var mout = require("mout");
  var Q = require("q");
  var Logger = require("bower-logger");
  var Project = require("../core/Project");
  var createLink = require("../util/createLink");
  var cli = require("../util/cli");
  var defaultConfig = require("../config");
  function linkSelf(config) {
    var project;
    var logger = new Logger();
    config = mout.object.deepFillIn(config || {}, defaultConfig);
    project = new Project(config, logger);
    project.getJson().then(function(json) {
      var src = config.cwd;
      var dst = path.join(config.storage.links, json.name);
      return Q.nfcall(rimraf, dst).then(function() {
        return createLink(src, dst);
      }).then(function() {
        return {
          src: src,
          dst: dst
        };
      });
    }).done(function(result) {
      logger.emit('end', result);
    }, function(error) {
      logger.emit('error', error);
    });
    return logger;
  }
  function linkTo(name, localName, config) {
    var src;
    var dst;
    var logger = new Logger();
    config = mout.object.deepFillIn(config || {}, defaultConfig);
    localName = localName || name;
    src = path.join(config.storage.links, name);
    dst = path.join(process.cwd(), config.directory, localName);
    Q.nfcall(rimraf, dst).then(function() {
      return createLink(src, dst);
    }).then(function() {
      return {
        src: src,
        dst: dst
      };
    }).done(function(result) {
      logger.emit('end', result);
    }, function(error) {
      logger.emit('error', error);
    });
    return logger;
  }
  var link = {
    linkTo: linkTo,
    linkSelf: linkSelf
  };
  link.line = function(argv) {
    var options = link.options(argv);
    var name = options.argv.remain[1];
    var localName = options.argv.remain[2];
    if (name) {
      return linkTo(name, localName);
    }
    return linkSelf();
  };
  link.options = function(argv) {
    return cli.readOptions(argv);
  };
  link.completion = function() {};
  module.exports = link;
})(require("process"));
