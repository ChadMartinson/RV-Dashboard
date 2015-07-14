/* */ 
var _ = require("lodash");
var util = require("util");
var clc = require("cli-color");
var Base = require("./base");
module.exports = Prompt;
function Prompt() {
  return Base.apply(this, arguments);
}
util.inherits(Prompt, Base);
Prompt.prototype._run = function(cb) {
  this.done = cb;
  this.rl.on("line", this.onSubmit.bind(this));
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
  var value = input || this.opt.default || "";
  this.validate(value, function(isValid) {
    if (isValid === true) {
      this.status = "answered";
      this.clean(1).render();
      this.write(clc.cyan(value) + "\n");
      this.rl.removeAllListeners("line");
      this.done(value);
    } else {
      this.error(isValid).clean().render();
    }
  }.bind(this));
};
