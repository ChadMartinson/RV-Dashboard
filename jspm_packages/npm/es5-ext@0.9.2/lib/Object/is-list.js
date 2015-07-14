/* */ 
'use strict';
var isFunction = require("../Function/is-function"),
    isObject = require("./is-object");
module.exports = function(x) {
  return ((x != null) && (typeof x.length === 'number') && ((isObject(x) && !isFunction(x)) || (typeof x === "string"))) || false;
};
