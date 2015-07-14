/* */ 
'use strict';
var callable = require("../../Object/valid-callable"),
    apply = Function.prototype.apply;
module.exports = function() {
  var fn = callable(this),
      args = arguments;
  return function() {
    return apply.call(fn, this, args);
  };
};
