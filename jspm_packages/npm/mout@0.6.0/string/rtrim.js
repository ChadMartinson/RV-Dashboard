/* */ 
var toString = require("../lang/toString");
var WHITE_SPACES = require("./WHITE_SPACES");
function rtrim(str, chars) {
  str = toString(str);
  chars = chars || WHITE_SPACES;
  var end = str.length - 1,
      charLen = chars.length,
      found = true,
      i,
      c;
  while (found && end >= 0) {
    found = false;
    i = -1;
    c = str.charAt(end);
    while (++i < charLen) {
      if (c === chars[i]) {
        found = true;
        end--;
        break;
      }
    }
  }
  return (end >= 0) ? str.substring(0, end + 1) : '';
}
module.exports = rtrim;
