/* */ 
var forOwn = require("../object/forOwn");
var isArray = require("./isArray");
function isEmpty(val) {
  if (val == null) {
    return false;
  } else if (typeof val === 'string' || isArray(val)) {
    return !val.length;
  } else if (typeof val === 'object' || typeof val === 'function') {
    var result = true;
    forOwn(val, function() {
      result = false;
      return false;
    });
    return result;
  } else {
    return false;
  }
}
module.exports = isEmpty;
