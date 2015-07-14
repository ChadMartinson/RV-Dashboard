/* */ 
var prop = require("./prop");
var deepMatches = require("../object/deepMatches");
function makeIterator(src, thisObj) {
  switch (typeof src) {
    case 'function':
      return (typeof thisObj !== 'undefined') ? function(val, i, arr) {
        return src.call(thisObj, val, i, arr);
      } : src;
    case 'object':
      return (src != null) ? function(val) {
        return deepMatches(val, src);
      } : src;
    case 'string':
    case 'number':
      return prop(src);
    default:
      return src;
  }
}
module.exports = makeIterator;
