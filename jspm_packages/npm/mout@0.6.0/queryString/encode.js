/* */ 
var forOwn = require("../object/forOwn");
function encode(obj) {
  var query = [];
  forOwn(obj, function(val, key) {
    query.push(key + '=' + encodeURIComponent(val));
  });
  return (query.length) ? '?' + query.join('&') : '';
}
module.exports = encode;
