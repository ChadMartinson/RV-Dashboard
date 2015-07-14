/* */ 
var MAX_INT = require("./MAX_INT");
function toUInt31(val) {
  return (val <= 0) ? 0 : (val > MAX_INT ? ~~(val % (MAX_INT + 1)) : ~~val);
}
module.exports = toUInt31;
