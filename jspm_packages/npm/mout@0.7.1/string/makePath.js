/* */ 
var join = require("../array/join");
function makePath(var_args) {
  var result = join(Array.prototype.slice.call(arguments), '/');
  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/');
}
module.exports = makePath;
