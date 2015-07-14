/* */ 
var mout = require("mout");
var Logger = require("bower-logger");
var Project = require("../core/Project");
var cli = require("../util/cli");
var defaultConfig = require("../config");
function prune(config) {
  var project;
  var logger = new Logger();
  config = mout.object.deepFillIn(config || {}, defaultConfig);
  project = new Project(config, logger);
  clean(project).done(function(removed) {
    logger.emit('end', removed);
  }, function(error) {
    logger.emit('error', error);
  });
  return logger;
}
function clean(project, removed) {
  removed = removed || {};
  return project.getTree().spread(function(tree, flattened, extraneous) {
    var names = extraneous.map(function(extra) {
      return extra.endpoint.name;
    });
    project.uninstall(names).then(function(uninstalled) {
      if (!mout.object.size(uninstalled)) {
        return removed;
      }
      mout.object.mixIn(removed, uninstalled);
      return clean(project, removed);
    });
  });
}
prune.line = function() {
  return prune();
};
prune.options = function(argv) {
  return cli.readOptions(argv);
};
prune.completion = function() {};
module.exports = prune;
