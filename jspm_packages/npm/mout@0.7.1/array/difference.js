/* */ 
var unique = require("./unique");
var filter = require("./filter");
var some = require("./some");
var contains = require("./contains");
function difference(arr) {
  var arrs = Array.prototype.slice.call(arguments, 1),
      result = filter(unique(arr), function(needle) {
        return !some(arrs, function(haystack) {
          return contains(haystack, needle);
        });
      });
  return result;
}
module.exports = difference;
