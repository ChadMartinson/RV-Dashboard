/* */ 
'use strict';
var value = require("../../Object/valid-value");
module.exports = function() {
  value(this).length = 0;
  return this;
};
