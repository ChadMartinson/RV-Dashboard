/* */ 
var isLeapYear = require("./isLeapYear");
function totalDaysInYear(fullYear) {
  return isLeapYear(fullYear) ? 366 : 365;
}
module.exports = totalDaysInYear;
