/* */ 
var randInt = require("../random/randInt");
function pick(arr) {
  if (arr == null || !arr.length)
    return ;
  var idx = randInt(0, arr.length - 1);
  return arr.splice(idx, 1)[0];
}
module.exports = pick;
