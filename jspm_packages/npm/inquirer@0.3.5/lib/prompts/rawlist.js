/* */ 
var _ = require("lodash");
var util = require("util");
var clc = require("cli-color");
var Base = require("./base");
var Separator = require("../objects/separator");
module.exports = Prompt;
function Prompt() {
  Base.apply(this, arguments);
  if (!this.opt.choices) {
    this.throwParamError("choices");
  }
  this.opt.validChoices = this.opt.choices.filter(Separator.exclude);
  this.selected = 0;
  this.rawDefault = 0;
  this.opt.choices.setRender(renderChoices);
  var def = this.opt.default;
  if (_.isNumber(def) && def >= 0 && def < this.opt.choices.realLength) {
    this.selected = this.rawDefault = def;
  }
  this.opt.default = null;
  return this;
}
util.inherits(Prompt, Base);
Prompt.prototype._run = function(cb) {
  this.done = cb;
  this.rl.on("line", this.onSubmit.bind(this));
  this.rl.on("keypress", this.onKeypress.bind(this));
  this.render();
  return this;
};
Prompt.prototype.render = function() {
  var message = this.getQuestion();
  var choicesStr = this.opt.choices.render(this.selected);
  if (this.status === "answered") {
    message += clc.cyan(this.opt.choices.getChoice(this.selected).name) + "\n";
  } else {
    message += choicesStr;
    message += "\n  Answer: ";
  }
  var msgLines = message.split(/\n/);
  this.height = msgLines.length;
  this.rl.setPrompt(_.last(msgLines));
  this.write(message);
  return this;
};
Prompt.prototype.onSubmit = function(input) {
  if (input == null || input === "") {
    input = this.rawDefault;
  } else {
    input -= 1;
  }
  var selectedChoice = this.opt.choices.getChoice(input);
  if (selectedChoice != null) {
    this.status = "answered";
    this.selected = input;
    this.down().clean(2).render();
    this.rl.removeAllListeners("line");
    this.rl.removeAllListeners("keypress");
    this.done(selectedChoice.value);
    return ;
  }
  this.error("Please enter a valid index").write(clc.bol(0, true)).clean().render();
};
Prompt.prototype.onKeypress = function(s, key) {
  var index = this.rl.line.length ? Number(this.rl.line) - 1 : 0;
  if (this.opt.choices.getChoice(index)) {
    this.selected = index;
  } else {
    this.selected = undefined;
  }
  this.cacheCursorPos().down().clean(1).render().write(this.rl.line).restoreCursorPos();
};
function renderChoices(pointer) {
  var output = "";
  var separatorOffset = 0;
  this.choices.forEach(function(choice, i) {
    output += "\n  ";
    if (choice instanceof Separator) {
      separatorOffset++;
      output += " " + choice;
      return ;
    }
    var index = i - separatorOffset;
    var display = (index + 1) + ") " + choice.name;
    if (index === pointer) {
      display = clc.cyan(display);
    }
    output += display;
  }.bind(this));
  return output;
}
