/* */ 
var isObject = require("../lang/isObject");
var equals = require("./equals");
function defaultCompare(a, b) {
  return a === b;
}
function deepEquals(a, b, callback) {
  callback = callback || defaultCompare;
  if (!isObject(a) || !isObject(b)) {
    return callback(a, b);
  }
  function compare(a, b) {
    return deepEquals(a, b, callback);
  }
  return equals(a, b, compare);
}
module.exports = deepEquals;
