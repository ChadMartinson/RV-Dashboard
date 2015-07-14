/* */ 
var difference = require("./difference");
var toArray = require("../lang/toArray");
function insert(arr, rest_items) {
  var diff = difference(toArray(arguments).slice(1), arr);
  if (diff.length) {
    Array.prototype.push.apply(arr, diff);
  }
  return arr.length;
}
module.exports = insert;
