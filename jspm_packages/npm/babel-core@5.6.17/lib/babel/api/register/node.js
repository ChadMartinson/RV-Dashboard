/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _sourceMapSupport = require("source-map-support");

var _sourceMapSupport2 = _interopRequireDefault(_sourceMapSupport);

var _cache = require("./cache");

var registerCache = _interopRequireWildcard(_cache);

var _transformationFileOptionsResolveRc = require("../../transformation/file/options/resolve-rc");

var _transformationFileOptionsResolveRc2 = _interopRequireDefault(_transformationFileOptionsResolveRc);

var _lodashObjectExtend = require("lodash/object/extend");

var _lodashObjectExtend2 = _interopRequireDefault(_lodashObjectExtend);

var _node = require("../node");

var babel = _interopRequireWildcard(_node);

var _lodashCollectionEach = require("lodash/collection/each");

var _lodashCollectionEach2 = _interopRequireDefault(_lodashCollectionEach);

var _util = require("../../util");

var util = _interopRequireWildcard(_util);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_sourceMapSupport2["default"].install({
  handleUncaughtExceptions: false,
  retrieveSourceMap: function retrieveSourceMap(source) {
    var map = maps && maps[source];
    if (map) {
      return {
        url: null,
        map: map
      };
    } else {
      return null;
    }
  }
});

//

registerCache.load();
var cache = registerCache.get();

//

var transformOpts = {};

var ignore;
var only;

var oldHandlers = {};
var maps = {};

var cwd = process.cwd();

var getRelativePath = function getRelativePath(filename) {
  return _path2["default"].relative(cwd, filename);
};

var mtime = function mtime(filename) {
  return +_fs2["default"].statSync(filename).mtime;
};

var compile = function compile(filename) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var result;

  opts = _lodashObjectExtend2["default"](opts, transformOpts);

  // this will be done when the file is transformed anyway but we need all
  // the options so we can generate the cache key
  _transformationFileOptionsResolveRc2["default"](filename, opts);

  var cacheKey = filename + ":" + JSON.stringify(opts) + ":" + babel.version;

  var env = process.env.BABEL_ENV || process.env.NODE_ENV;
  if (env) cacheKey += ":" + env;

  if (cache) {
    var cached = cache[cacheKey];
    if (cached && cached.mtime === mtime(filename)) {
      result = cached;
    }
  }

  if (!result) {
    result = babel.transformFileSync(filename, _lodashObjectExtend2["default"](opts, {
      sourceMap: "both",
      ast: false
    }));
  }

  if (cache) {
    result.mtime = mtime(filename);
    cache[cacheKey] = result;
  }

  maps[filename] = result.map;

  return result.code;
};

var shouldIgnore = function shouldIgnore(filename) {
  if (!ignore && !only) {
    return getRelativePath(filename).split(_path2["default"].sep).indexOf("node_modules") >= 0;
  } else {
    return util.shouldIgnore(filename, ignore || [], only);
  }
};

var istanbulMonkey = {};

if (process.env.running_under_istanbul) {
  // we need to monkey patch fs.readFileSync so we can hook into
  // what istanbul gets, it's extremely dirty but it's the only way
  var _readFileSync = _fs2["default"].readFileSync;

  _fs2["default"].readFileSync = function (filename) {
    if (istanbulMonkey[filename]) {
      delete istanbulMonkey[filename];
      var code = compile(filename, {
        auxiliaryCommentBefore: "istanbul ignore next"
      });
      istanbulMonkey[filename] = true;
      return code;
    } else {
      return _readFileSync.apply(this, arguments);
    }
  };
}

var istanbulLoader = function istanbulLoader(m, filename, old) {
  istanbulMonkey[filename] = true;
  old(m, filename);
};

var normalLoader = function normalLoader(m, filename) {
  m._compile(compile(filename), filename);
};

var registerExtension = function registerExtension(ext) {
  var old = oldHandlers[ext] || oldHandlers[".js"] || require.extensions[".js"];

  var loader = normalLoader;
  if (process.env.running_under_istanbul) loader = istanbulLoader;

  require.extensions[ext] = function (m, filename) {
    if (shouldIgnore(filename)) {
      old(m, filename);
    } else {
      loader(m, filename, old);
    }
  };
};

var hookExtensions = function hookExtensions(_exts) {
  _lodashCollectionEach2["default"](oldHandlers, function (old, ext) {
    if (old === undefined) {
      delete require.extensions[ext];
    } else {
      require.extensions[ext] = old;
    }
  });

  oldHandlers = {};

  _lodashCollectionEach2["default"](_exts, function (ext) {
    oldHandlers[ext] = require.extensions[ext];
    registerExtension(ext);
  });
};

hookExtensions(util.canCompile.EXTENSIONS);

exports["default"] = function () {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (opts.only != null) only = util.arrayify(opts.only, util.regexify);
  if (opts.ignore != null) ignore = util.arrayify(opts.ignore, util.regexify);

  if (opts.extensions) hookExtensions(util.arrayify(opts.extensions));

  if (opts.cache === false) cache = null;

  delete opts.extensions;
  delete opts.ignore;
  delete opts.cache;
  delete opts.only;

  _lodashObjectExtend2["default"](transformOpts, opts);
};

module.exports = exports["default"];