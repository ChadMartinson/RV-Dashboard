/* */ 
var map = require("./map");
function pluck(list, key) {
  return map(list, function(value) {
    return value[key];
  });
}
module.exports = pluck;
