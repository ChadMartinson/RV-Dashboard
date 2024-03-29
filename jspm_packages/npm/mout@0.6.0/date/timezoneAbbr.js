/* */ 
var timezoneOffset = require("./timezoneOffset");
function timezoneAbbr(date) {
  var tz = /\(([A-Z]{3,4})\)/.exec(date.toString());
  return tz ? tz[1] : timezoneOffset(date);
}
module.exports = timezoneAbbr;
