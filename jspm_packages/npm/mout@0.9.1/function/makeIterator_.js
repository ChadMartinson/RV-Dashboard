/* */ 
var identity = require("./identity");
var prop = require("./prop");
var deepMatches = require("../object/deepMatches");
function makeIterator(src, thisObj) {
  if (src == null) {
    return identity;
  }
  switch (typeof src) {
    case 'function':
      return (typeof thisObj !== 'undefined') ? function(val, i, arr) {
        return src.call(thisObj, val, i, arr);
      } : src;
    case 'object':
      return function(val) {
        return deepMatches(val, src);
      };
    case 'string':
    case 'number':
      return prop(src);
  }
}
module.exports = makeIterator;
