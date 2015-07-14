/* */ 
var max = require("./max");
var pluck = require("./pluck");
var map = require("./map");
function getLength(arr) {
  return arr == null ? 0 : arr.length;
}
function zip(arr) {
  var len = arr ? max(map(arguments, getLength)) : 0,
      results = [],
      i = -1,
      item;
  while (++i < len) {
    results.push(map(arguments, function(item) {
      return item == null ? undefined : item[i];
    }));
  }
  return results;
}
module.exports = zip;
