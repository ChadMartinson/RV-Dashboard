/* */ 
var lpad = require("../string/lpad");
function pad(n, minLength, char) {
  return lpad('' + n, minLength, char || '0');
}
module.exports = pad;
