/* */ 
var randBool = require("./randBool");
function randomSign() {
  return randBool() ? 1 : -1;
}
module.exports = randomSign;
