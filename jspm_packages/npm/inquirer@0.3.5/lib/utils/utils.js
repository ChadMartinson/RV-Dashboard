/* */ 
(function(process) {
  "use strict";
  var _ = require("lodash");
  var clc = require("cli-color");
  var Separator = require("../objects/separator");
  var Choice = require("../objects/choice");
  var utils = module.exports;
  utils.runAsync = function(func, cb) {
    var rest = [];
    var len = 1;
    while (len++ < arguments.length) {
      rest.push(arguments[len]);
    }
    var async = false;
    var isValid = func.apply({async: function() {
        async = true;
        return _.once(cb);
      }}, rest);
    if (!async) {
      cb(isValid);
    }
  };
  utils.getPointer = function() {
    if (process.platform === "win32")
      return ">";
    if (process.platform === "linux")
      return "‣";
    return "❯";
  };
  utils.getCheckbox = function(checked, after) {
    var win32 = (process.platform === "win32");
    var check = "";
    after || (after = "");
    if (checked) {
      check = clc.green(win32 ? "[X]" : "⬢");
    } else {
      check = win32 ? "[ ]" : "⬡";
    }
    return check + " " + after;
  };
})(require("process"));
