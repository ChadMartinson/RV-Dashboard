/* */ 
var forEach = require("../array/forEach");
var forOwn = require("./forOwn");
function fillIn(obj, var_defaults) {
  forEach(Array.prototype.slice.call(arguments, 1), function(base) {
    forOwn(base, function(val, key) {
      if (obj[key] == null) {
        obj[key] = val;
      }
    });
  });
  return obj;
}
module.exports = fillIn;
