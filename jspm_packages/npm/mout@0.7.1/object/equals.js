/* */ 
var hasOwn = require("./hasOwn");
var every = require("./every");
var isObject = require("../lang/isObject");
function defaultCompare(a, b) {
  return a === b;
}
function makeCompare(callback) {
  return function(value, key) {
    return hasOwn(this, key) && callback(value, this[key]);
  };
}
function checkProperties(value, key) {
  return hasOwn(this, key);
}
function equals(a, b, callback) {
  callback = callback || defaultCompare;
  if (!isObject(a) || !isObject(b)) {
    return callback(a, b);
  }
  return (every(a, makeCompare(callback), b) && every(b, checkProperties, a));
}
module.exports = equals;
