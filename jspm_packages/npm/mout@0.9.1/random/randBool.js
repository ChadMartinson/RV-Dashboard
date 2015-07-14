/* */ 
var random = require("./random");
function randBool() {
  return random() >= 0.5;
}
module.exports = randBool;
