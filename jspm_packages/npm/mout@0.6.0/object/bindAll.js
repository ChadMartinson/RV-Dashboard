/* */ 
var functions = require("./functions");
var bind = require("../function/bind");
var forEach = require("../array/forEach");
function bindAll(obj, rest_methodNames) {
  var keys = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : functions(obj);
  forEach(keys, function(key) {
    obj[key] = bind(obj[key], obj);
  });
}
module.exports = bindAll;
