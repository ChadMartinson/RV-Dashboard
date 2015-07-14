/* */ 
var isNumber = require("./isNumber");
function isNaN(val) {
  return !isNumber(val) || val != +val;
}
module.exports = isNaN;
