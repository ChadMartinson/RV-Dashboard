/* */ 
"format cjs";
define(function(require) {
  return {
    'bind': require("./function/bind"),
    'compose': require("./function/compose"),
    'debounce': require("./function/debounce"),
    'func': require("./function/func"),
    'makeIterator_': require("./function/makeIterator_"),
    'partial': require("./function/partial"),
    'prop': require("./function/prop"),
    'series': require("./function/series"),
    'throttle': require("./function/throttle"),
    'timeout': require("./function/timeout")
  };
});
