/* */ 
var forOwn = require("./forOwn");
var makeIterator = require("../function/makeIterator_");
function some(obj, callback, thisObj) {
  callback = makeIterator(callback, thisObj);
  var result = false;
  forOwn(obj, function(val, key) {
    if (callback(val, key, obj)) {
      result = true;
      return false;
    }
  });
  return result;
}
module.exports = some;
