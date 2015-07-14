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
  this.validate();
  this.opt.choices.push({
    key: "h",
    name: "Help, list all options",
    value: "help"
  });
  this.opt.choices.setRender(renderChoice);
  var defIndex = 0;
  if (_.isNumber(this.opt.default) && this.opt.choices.getChoice(this.opt.default)) {
    defIndex = this.opt.default;
  }
  var defStr = this.opt.choices.pluck("key");
  this.rawDefault = defStr[defIndex];
  defStr[defIndex] = String(defStr[defIndex]).toUpperCase();
  this.opt.default = defStr.join("");
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
  if (this.status === "answered") {
    message += clc.cyan(this.selected.name) + "\n";
  } else if (this.status === "expanded") {
    message += this.opt.choices.render(this.selectedKey);
    message += "\n  Answer: ";
  }
  var msgLines = message.split(/\n/);
  this.height = msgLines.length;
  this.rl.setPrompt(_.last(msgLines));
  this.write(message);
  return this;
};
Prompt.prototype.getChoices = function() {
  var output = "";
  this.opt.choices.forEach(function(choice, i) {
    output += "\n  ";
    if (choice instanceof Separator) {
      output += " " + choice;
      return ;
    }
    var choiceStr = choice.key + ") " + choice.name;
    if (this.selectedKey === choice.key) {
      choiceStr = clc.cyan(choiceStr);
    }
    output += choiceStr;
  }.bind(this));
  return output;
};
Prompt.prototype.onSubmit = function(input) {
  if (input == null || input === "") {
    input = this.rawDefault;
  }
  var selected = this.opt.choices.where({key: input.toLowerCase()})[0];
  if (selected != null && selected.key === "h") {
    this.selectedKey = "";
    this.status = "expanded";
    this.down().clean(2).render();
    return ;
  }
  if (selected != null) {
    this.status = "answered";
    this.selected = selected;
    this.down().clean(2).render();
    this.rl.removeAllListeners("line");
    this.rl.removeAllListeners("keypress");
    this.done(this.selected.value);
    return ;
  }
  this.error("Please enter a valid command").clean().render();
};
Prompt.prototype.onKeypress = function(s, key) {
  this.selectedKey = this.rl.line.toLowerCase();
  var selected = this.opt.choices.where({key: this.selectedKey})[0];
  this.cacheCursorPos();
  if (this.status === "expanded") {
    this.clean().render();
  } else {
    this.down().hint(selected ? selected.name : "").clean().render();
  }
  this.write(this.rl.line).restoreCursorPos();
};
Prompt.prototype.validate = function() {
  var formatError;
  var errors = [];
  var keymap = {};
  this.opt.choices.filter(Separator.exclude).map(function(choice) {
    if (!choice.key || choice.key.length !== 1) {
      formatError = true;
    }
    if (keymap[choice.key]) {
      errors.push(choice.key);
    }
    keymap[choice.key] = true;
    choice.key = String(choice.key).toLowerCase();
  });
  if (formatError) {
    throw new Error("Format error: `key` param must be a single letter and is required.");
  }
  if (keymap.h) {
    throw new Error("Reserved key error: `key` param cannot be `h` - this value is reserved.");
  }
  if (errors.length) {
    throw new Error("Duplicate key error: `key` param must be unique. Duplicates: " + _.uniq(errors).join(", "));
  }
};
function renderChoice(pointer) {
  var output = "";
  this.choices.forEach(function(choice, i) {
    output += "\n  ";
    if (choice instanceof Separator) {
      output += " " + choice;
      return ;
    }
    var choiceStr = choice.key + ") " + choice.name;
    if (pointer === choice.key) {
      choiceStr = clc.cyan(choiceStr);
    }
    output += choiceStr;
  }.bind(this));
  return output;
}
