/* */ 
(function(process) {
  'use strict';
  if ((typeof process !== 'undefined') && process && (typeof process.nextTick === 'function')) {
    module.exports = process.nextTick;
  } else if (typeof setImmediate === 'function') {
    module.exports = function(cb) {
      setImmediate(cb);
    };
  } else {
    module.exports = function(cb) {
      setTimeout(cb, 0);
    };
  }
})(require("process"));
