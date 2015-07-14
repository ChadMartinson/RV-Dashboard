/* */ 
var toString = require("../lang/toString");
function repeat(str, n) {
  str = toString(str);
  return (new Array(n + 1)).join(str);
}
module.exports = repeat;
