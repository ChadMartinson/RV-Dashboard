/* */ 
var forOwn = require("./forOwn");
var keys = Object.keys || function(obj) {
  var keys = [];
  forOwn(obj, function(val, key) {
    keys.push(key);
  });
  return keys;
};
module.exports = keys;
