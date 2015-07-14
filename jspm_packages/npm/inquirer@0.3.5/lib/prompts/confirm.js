/* */ 
var _ = require("lodash");
var util = require("util");
var clc = require("cli-color");
var Base = require("./base");
module.exports = Prompt;
function Prompt() {
  Base.apply(this, arguments);
  var rawDefault = true;
  _.extend(this.opt, {filter: function(input) {
      var value = rawDefault;
      if (input != null && input !== "") {
        value = /^y(es)?/i.test(input);
      }
      return value;
    }.bind(this)});
  if (_.isBoolean(this.opt.default)) {
    rawDefault = this.opt.default;
  }
  this.opt.default = rawDefault ? "Y/n" : "y/N";
  return this;
}
util.inherits(Prompt, Base);
Prompt.prototype._run = function(cb) {
  this.done = cb;
  this.rl.once("line", this.onSubmit.bind(this));
  this.render();
  return this;
};
Prompt.prototype.render = function() {
  var message = this.getQuestion();
  this.write(message);
  var msgLines = message.split(/\n/);
  this.height = msgLines.length;
  this.rl.setPrompt(_.last(msgLines));
  return this;
};
Prompt.prototype.onSubmit = function(input) {
  this.status = "answered";
  this.filter(input, function(output) {
    this.clean(1).render();
    this.write(clc.cyan(output ? "Yes" : "No") + "\n");
    this.done(input);
  }.bind(this));
};
