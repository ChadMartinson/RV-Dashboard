/* */ 
var slice = require("../array/slice");
function partial(fn, var_args) {
  var argsArr = slice(arguments, 1);
  return function() {
    return fn.apply(this, argsArr.concat(slice(arguments)));
  };
}
module.exports = partial;
