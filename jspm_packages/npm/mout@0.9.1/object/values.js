/* */ 
var forOwn = require("./forOwn");
function values(obj) {
  var vals = [];
  forOwn(obj, function(val, key) {
    vals.push(val);
  });
  return vals;
}
module.exports = values;
