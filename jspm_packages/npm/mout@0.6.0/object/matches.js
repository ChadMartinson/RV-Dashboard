/* */ 
var forOwn = require("./forOwn");
function matches(target, props) {
  var result = true;
  forOwn(props, function(val, key) {
    if (target[key] !== val) {
      return (result = false);
    }
  });
  return result;
}
module.exports = matches;
