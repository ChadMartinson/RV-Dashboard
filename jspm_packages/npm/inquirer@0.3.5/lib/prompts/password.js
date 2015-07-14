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
  this.rl.on("keypress", this.onKeypress.bind(this));
  this.render();
  this.rl.output.mute();
  return this;
};
Prompt.prototype.render = function() {
  var message = this.getQuestion();
  var msgLines = message.split(/\n/);
  this.height = msgLines.length;
  this.rl.setPrompt(_.last(msgLines));
  this.write(message);
  return this;
};
Prompt.prototype.onSubmit = function(input) {
  var value = input || this.opt.default || "";
  this.rl.output.unmute();
  this.write("\n");
  this.validate(value, function(isValid) {
    if (isValid === true) {
      this.status = "answered";
      this.clean(1).render();
      var mask = new Array(value.length + 1).join("*");
      this.write(clc.cyan(mask) + "\n");
      this.rl.removeAllListeners("line");
      this.rl.removeAllListeners("keypress");
      this.done(value);
    } else {
      this.error(isValid).clean().render();
      this.rl.output.mute();
    }
  }.bind(this));
};
Prompt.prototype.onKeypress = function() {
  this.rl.output.unmute();
  this.cacheCursorPos().clean().render();
  var mask = new Array(this.rl.line.length + 1).join("*");
  this.write(mask).restoreCursorPos();
  this.rl.output.mute();
};
