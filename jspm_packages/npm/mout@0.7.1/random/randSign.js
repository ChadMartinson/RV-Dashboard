/* */ 
var random = require("./random");
function randomSign() {
  return random() > 0.5 ? 1 : -1;
}
module.exports = randomSign;
