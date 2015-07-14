/* */ 
var toString = require("../lang/toString");
function removeNonWord(str) {
  str = toString(str);
  return str.replace(/[^0-9a-zA-Z\xC0-\xFF \-_]/g, '');
}
module.exports = removeNonWord;
