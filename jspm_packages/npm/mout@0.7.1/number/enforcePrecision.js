/* */ 
var toNumber = require("../lang/toNumber");
function enforcePrecision(val, nDecimalDigits) {
  val = toNumber(val);
  var pow = Math.pow(10, nDecimalDigits);
  return +(Math.round(val * pow) / pow).toFixed(nDecimalDigits);
}
module.exports = enforcePrecision;
