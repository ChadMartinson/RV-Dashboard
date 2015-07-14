/* */ 
'use strict';
var callable = require("../../Object/valid-callable"),
    value = require("../../Object/valid-value"),
    forEach = Array.prototype.forEach,
    apply = Function.prototype.apply;
module.exports = function(cb) {
  var self,
      r;
  self = Object(value(this));
  callable(cb);
  r = {};
  forEach.call(this, function(v) {
    var key = apply.call(cb, this, arguments);
    if (!r.hasOwnProperty(key)) {
      r[key] = [];
    }
    r[key].push(v);
  }, arguments[1]);
  return r;
};
