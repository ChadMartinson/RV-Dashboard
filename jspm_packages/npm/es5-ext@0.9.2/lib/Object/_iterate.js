/* */ 
'use strict';
var isCallable = require("./is-callable"),
    callable = require("./valid-callable"),
    value = require("./valid-value"),
    call = Function.prototype.call,
    keys = Object.keys;
module.exports = function(method) {
  return function(obj, cb) {
    var list,
        thisArg = arguments[2],
        compareFn = arguments[3];
    obj = Object(value(obj));
    callable(cb);
    list = keys(obj);
    if (compareFn) {
      list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
    }
    return list[method](function(key, index) {
      return call.call(cb, thisArg, obj[key], key, obj, index);
    });
  };
};
