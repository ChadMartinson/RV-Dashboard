/* */ 
var indexOf = require("./indexOf");
var filter = require("./filter");
function unique(arr) {
  return filter(arr, isUnique);
}
function isUnique(item, i, arr) {
  return indexOf(arr, item, i + 1) === -1;
}
module.exports = unique;
