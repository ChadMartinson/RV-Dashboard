/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

var _stripJsonComments = require("strip-json-comments");

var _stripJsonComments2 = _interopRequireDefault(_stripJsonComments);

var _index = require("./index");

var _helpersMerge = require("../../../helpers/merge");

var _helpersMerge2 = _interopRequireDefault(_helpersMerge);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _pathExists = require("path-exists");

var _pathExists2 = _interopRequireDefault(_pathExists);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var cache = {};
var jsons = {};

function exists(filename) {
  var cached = cache[filename];
  if (cached != null) return cached;
  return cache[filename] = _pathExists2["default"].sync(filename);
}

exports["default"] = function (loc) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var rel = ".babelrc";

  if (!opts.babelrc) {
    opts.babelrc = [];
  }

  function find(start, rel) {
    var file = _path2["default"].join(start, rel);

    if (opts.babelrc.indexOf(file) >= 0) {
      return;
    }

    if (exists(file)) {
      var content = _fs2["default"].readFileSync(file, "utf8");
      var json;

      try {
        json = jsons[content] = jsons[content] || JSON.parse(_stripJsonComments2["default"](content));
        _index.normaliseOptions(json);
      } catch (err) {
        err.message = file + ": " + err.message;
        throw err;
      }

      opts.babelrc.push(file);

      if (json.breakConfig) return;

      _helpersMerge2["default"](opts, json);
    }

    var up = _path2["default"].dirname(start);
    if (up !== start) {
      // root
      find(up, rel);
    }
  }

  if (opts.babelrc.indexOf(loc) < 0 && opts.breakConfig !== true) {
    find(loc, rel);
  }

  return opts;
};

module.exports = exports["default"];