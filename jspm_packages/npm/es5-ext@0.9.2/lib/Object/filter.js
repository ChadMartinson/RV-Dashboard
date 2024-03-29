/* */ 
'use strict';
var callable = require("./valid-callable"),
    forEach = require("./for-each"),
    call = Function.prototype.call;
module.exports = function(obj, cb) {
  var o = {},
      thisArg = arguments[2];
  callable(cb);
  forEach(obj, function(value, key, obj, index) {
    if (call.call(cb, thisArg, value, key, obj, index)) {
      o[key] = obj[key];
    }
  });
  return o;
};
