/* */ 
(function(process) {
  var _ = require("lodash");
  var Separator = require("./separator");
  module.exports = Choice;
  function Choice(val) {
    if (val instanceof Choice || val instanceof Separator) {
      return val;
    }
    if (_.isString(val)) {
      this.name = val;
      this.value = val;
    } else {
      _.extend(this, val, {
        name: val.name || val.value,
        value: val.value || val.name
      });
    }
  }
})(require("process"));
