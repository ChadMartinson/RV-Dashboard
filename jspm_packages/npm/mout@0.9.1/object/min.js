/* */ 
var arrMin = require("../array/min");
var values = require("./values");
function min(obj, iterator) {
  return arrMin(values(obj), iterator);
}
module.exports = min;
