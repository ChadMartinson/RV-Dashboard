/* */ 
var is = require("./is");
function isnt(x, y) {
  return !is(x, y);
}
module.exports = isnt;
