/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;
exports.register = register;
exports.polyfill = polyfill;
exports.transformFile = transformFile;
exports.transformFileSync = transformFileSync;
exports.parse = parse;

function _interopRequire(obj) { return obj && obj.__esModule ? obj["default"] : obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _lodashLangIsFunction = require("lodash/lang/isFunction");

var _lodashLangIsFunction2 = _interopRequireDefault(_lodashLangIsFunction);

var _transformation = require("../transformation");

var _transformation2 = _interopRequireDefault(_transformation);

var _acorn = require("../../acorn");

var acorn = _interopRequireWildcard(_acorn);

var _util = require("../util");

var util = _interopRequireWildcard(_util);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _types = require("../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

exports.util = util;
exports.acorn = acorn;
exports.transform = _transformation2["default"];
exports.pipeline = _transformation.pipeline;
exports.canCompile = _util.canCompile;

var _transformationFileOptionsConfig = require("../transformation/file/options/config");

exports.options = _interopRequire(_transformationFileOptionsConfig);

var _transformationPlugin = require("../transformation/plugin");

exports.Plugin = _interopRequire(_transformationPlugin);

var _transformationTransformer = require("../transformation/transformer");

exports.Transformer = _interopRequire(_transformationTransformer);

var _transformationPipeline = require("../transformation/pipeline");

exports.Pipeline = _interopRequire(_transformationPipeline);

var _traversal = require("../traversal");

exports.traverse = _interopRequire(_traversal);

var _toolsBuildExternalHelpers = require("../tools/build-external-helpers");

exports.buildExternalHelpers = _interopRequire(_toolsBuildExternalHelpers);

var _package = require("../../../package");

exports.version = _package.version;
exports.types = t;

function register(opts) {
  var callback = require("./register/node-polyfill");
  if (opts != null) callback(opts);
  return callback;
}

function polyfill() {
  require("../polyfill");
}

function transformFile(filename, opts, callback) {
  if (_lodashLangIsFunction2["default"](opts)) {
    callback = opts;
    opts = {};
  }

  opts.filename = filename;

  _fs2["default"].readFile(filename, function (err, code) {
    if (err) return callback(err);

    var result;

    try {
      result = _transformation2["default"](code, opts);
    } catch (err) {
      return callback(err);
    }

    callback(null, result);
  });
}

function transformFileSync(filename) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  opts.filename = filename;
  return _transformation2["default"](_fs2["default"].readFileSync(filename, "utf8"), opts);
}

function parse(code) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  opts.allowHashBang = true;
  opts.sourceType = "module";
  opts.ecmaVersion = Infinity;
  opts.plugins = {
    jsx: true,
    flow: true
  };
  opts.features = {};

  for (var key in _transformation2["default"].pipeline.transformers) {
    opts.features[key] = true;
  }

  return acorn.parse(code, opts);
}