/* */ 
var isNumber = require("./isNumber");
var global = this;
function isFinite(val) {
  var is = false;
  if (typeof val === 'string' && val !== '') {
    is = global.isFinite(parseFloat(val));
  } else if (isNumber(val)) {
    is = global.isFinite(val);
  }
  return is;
}
module.exports = isFinite;
