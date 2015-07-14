/* */ 
"format cjs";
define(function(require) {
  return {
    'VERSION': '0.6.0',
    'array': require("./array"),
    'collection': require("./collection"),
    'date': require("./date"),
    'function': require("./function"),
    'lang': require("./lang"),
    'math': require("./math"),
    'number': require("./number"),
    'object': require("./object"),
    'queryString': require("./queryString"),
    'random': require("./random"),
    'string': require("./string"),
    'time': require("./time")
  };
});
