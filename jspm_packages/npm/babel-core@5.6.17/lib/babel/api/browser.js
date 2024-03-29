/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint no-new-func: 0 */

require("./node");
var transform = module.exports = require("../transformation");

transform.options = require("../transformation/file/options");
transform.version = require("../../../package").version;

transform.transform = transform;

transform.run = function (code) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  opts.sourceMaps = "inline";
  return new Function(transform(code, opts).code)();
};

transform.load = function (url, callback, opts, hold) {
  if (opts === undefined) opts = {};

  opts.filename = opts.filename || url;

  var xhr = global.ActiveXObject ? new global.ActiveXObject("Microsoft.XMLHTTP") : new global.XMLHttpRequest();
  xhr.open("GET", url, true);
  if ("overrideMimeType" in xhr) xhr.overrideMimeType("text/plain");

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    var status = xhr.status;
    if (status === 0 || status === 200) {
      var param = [xhr.responseText, opts];
      if (!hold) transform.run.apply(transform, param);
      if (callback) callback(param);
    } else {
      throw new Error("Could not load " + url);
    }
  };

  xhr.send(null);
};

var runScripts = function runScripts() {
  var scripts = [];
  var types = ["text/ecmascript-6", "text/6to5", "text/babel", "module"];
  var index = 0;

  var exec = function exec() {
    var param = scripts[index];
    if (param instanceof Array) {
      transform.run.apply(transform, param);
      index++;
      exec();
    }
  };

  var run = function run(script, i) {
    var opts = {};

    if (script.src) {
      transform.load(script.src, function (param) {
        scripts[i] = param;
        exec();
      }, opts, true);
    } else {
      opts.filename = "embedded";
      scripts[i] = [script.innerHTML, opts];
    }
  };

  var _scripts = global.document.getElementsByTagName("script");

  for (var i = 0; i < _scripts.length; ++i) {
    var _script = _scripts[i];
    if (types.indexOf(_script.type) >= 0) scripts.push(_script);
  }

  for (i in scripts) {
    run(scripts[i], i);
  }

  exec();
};

if (global.addEventListener) {
  global.addEventListener("DOMContentLoaded", runScripts, false);
} else if (global.attachEvent) {
  global.attachEvent("onload", runScripts);
}