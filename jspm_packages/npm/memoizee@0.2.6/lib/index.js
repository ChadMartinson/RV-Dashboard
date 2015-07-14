/* */ 
'use strict';
var regular = require("./regular"),
    primitive = require("./primitive"),
    call = Function.prototype.call;
require("./ext/dispose");
require("./ext/resolvers");
require("./ext/async");
require("./ext/ref-counter");
require("./ext/method");
require("./ext/max-age");
require("./ext/max");
module.exports = function(fn) {
  var options = Object(arguments[1]);
  return call.call(options.primitive ? primitive : regular, this, fn, options);
};
