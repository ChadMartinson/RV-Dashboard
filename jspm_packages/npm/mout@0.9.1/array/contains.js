/* */ 
var indexOf = require("./indexOf");
function contains(arr, val) {
  return indexOf(arr, val) !== -1;
}
module.exports = contains;
