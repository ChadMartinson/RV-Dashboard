/* */ 
var findLastIndex = require("./findLastIndex");
function findLast(arr, iterator, thisObj) {
  var idx = findLastIndex(arr, iterator, thisObj);
  return idx >= 0 ? arr[idx] : void(0);
}
module.exports = findLast;
