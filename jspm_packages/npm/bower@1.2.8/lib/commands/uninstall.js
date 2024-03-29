/* */ 
var mout = require("mout");
var Logger = require("bower-logger");
var Q = require("q");
var Project = require("../core/Project");
var cli = require("../util/cli");
var defaultConfig = require("../config");
function uninstall(names, options, config) {
  var project;
  var logger = new Logger();
  options = options || {};
  config = mout.object.deepFillIn(config || {}, defaultConfig);
  project = new Project(config, logger);
  project.getTree().spread(function(tree, flattened) {
    return project.uninstall(names, options).then(function(uninstalled) {
      var names = Object.keys(uninstalled);
      var children = [];
      mout.object.forOwn(flattened, function(node) {
        if (names.indexOf(node.endpoint.name) !== -1) {
          children.push.apply(children, mout.object.keys(node.dependencies));
        }
      });
      return clean(project, children, uninstalled);
    });
  }).done(function(uninstalled) {
    logger.emit('end', uninstalled);
  }, function(error) {
    logger.emit('error', error);
  });
  return logger;
}
function clean(project, names, removed) {
  removed = removed || {};
  return project.getTree().spread(function(tree, flattened) {
    var nodes = [];
    mout.object.forOwn(flattened, function(node) {
      if (names.indexOf(node.endpoint.name) !== -1) {
        nodes.push(node);
      }
    });
    nodes = nodes.filter(function(node) {
      return !node.nrDependants;
    });
    if (!nodes.length) {
      return Q.resolve(removed);
    }
    names = nodes.map(function(node) {
      return node.endpoint.name;
    });
    return project.uninstall(names).then(function(uninstalled) {
      var children;
      mout.object.mixIn(removed, uninstalled);
      children = [];
      nodes.forEach(function(node) {
        children.push.apply(children, mout.object.keys(node.dependencies));
      });
      return clean(project, children, removed);
    });
  });
}
uninstall.line = function(argv) {
  var options = uninstall.options(argv);
  var names = options.argv.remain.slice(1);
  if (!names.length) {
    return null;
  }
  return uninstall(names, options);
};
uninstall.options = function(argv) {
  return cli.readOptions({
    'save': {
      type: Boolean,
      shorthand: 'S'
    },
    'save-dev': {
      type: Boolean,
      shorthand: 'D'
    }
  }, argv);
};
uninstall.completion = function() {};
module.exports = uninstall;
