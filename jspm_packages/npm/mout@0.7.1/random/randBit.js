/* */ 
var random = require("./random");
function randomBit() {
  return random() > 0.5 ? 1 : 0;
}
module.exports = randomBit;
