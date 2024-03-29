/* */ 
var prop = require("./prop");
var deepMatches = require("../object/deepMatches");
function makeIterator(src, thisObj) {
  switch (typeof src) {
    case 'object':
      return (src != null) ? function(val, key, target) {
        return deepMatches(val, src);
      } : src;
    case 'string':
    case 'number':
      return prop(src);
    case 'function':
      if (typeof thisObj === 'undefined') {
        return src;
      } else {
        return function(val, i, arr) {
          return src.call(thisObj, val, i, arr);
        };
      }
    default:
      return src;
  }
}
module.exports = makeIterator;
