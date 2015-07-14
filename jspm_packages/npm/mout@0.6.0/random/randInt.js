/* */ 
var MIN_INT = require("../number/MIN_INT");
var MAX_INT = require("../number/MAX_INT");
var rand = require("./rand");
function randInt(min, max) {
  min = min == null ? MIN_INT : ~~min;
  max = max == null ? MAX_INT : ~~max;
  return Math.round(rand(min - 0.5, max + 0.499999999999));
}
module.exports = randInt;
