/* */ 
var cardinal = require("../cardinal");
var code = '' + function add(a, b) {
  var sum = a + b;
  return sum;
} + '';
console.log(cardinal.highlight(code));
