/* */ 
var toString = require("../lang/toString");
var stache = /\{\{(\w+)\}\}/g;
function interpolate(template, replacements, syntax) {
  template = toString(template);
  var replaceFn = function(match, prop) {
    return (prop in replacements) ? toString(replacements[prop]) : '';
  };
  return template.replace(syntax || stache, replaceFn);
}
module.exports = interpolate;
