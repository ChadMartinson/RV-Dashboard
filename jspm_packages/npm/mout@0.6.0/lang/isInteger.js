/* */ 
var isNumber = require("./isNumber");
function isInteger(val) {
  return isNumber(val) && (val % 1 === 0);
}
module.exports = isInteger;
