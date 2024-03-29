/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;
exports.validateOption = validateOption;
exports.normaliseOptions = normaliseOptions;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _parsers = require("./parsers");

var parsers = _interopRequireWildcard(_parsers);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

exports.config = _config2["default"];

function validateOption(key, val, pipeline) {
  var opt = _config2["default"][key];
  var parser = opt && parsers[opt.type];
  if (parser && parser.validate) {
    return parser.validate(key, val, pipeline);
  } else {
    return val;
  }
}

function normaliseOptions() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  for (var key in options) {
    var val = options[key];
    if (val == null) continue;

    var opt = _config2["default"][key];
    if (!opt) continue;

    var parser = parsers[opt.type];
    if (parser) val = parser(val);

    options[key] = val;
  }

  return options;
}