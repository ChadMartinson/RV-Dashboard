/* */ 
var toString = require("../lang/toString");
var ESCAPE_CHARS = /[\\.+*?\^$\[\](){}\/'#]/g;
function escapeRegExp(str) {
  str = toString(str);
  return str.replace(ESCAPE_CHARS, '\\$&');
}
module.exports = escapeRegExp;
