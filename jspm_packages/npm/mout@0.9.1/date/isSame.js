/* */ 
var startOf = require("./startOf");
function isSame(date1, date2, period) {
  if (period) {
    date1 = startOf(date1, period);
    date2 = startOf(date2, period);
  }
  return Number(date1) === Number(date2);
}
module.exports = isSame;
