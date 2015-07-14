/* */ 
(function(process) {
  var _ = require("lodash");
  var util = require("util");
  var clc = require("cli-color");
  var Base = require("./base");
  var Separator = require("../objects/separator");
  var utils = require("../utils/utils");
  module.exports = Prompt;
  function Prompt() {
    Base.apply(this, arguments);
    if (!this.opt.choices) {
      this.throwParamError("choices");
    }
    this.firstRender = true;
    this.pointer = 0;
    this.opt.choices.setRender(renderChoices);
    this.opt.default = null;
    return this;
  }
  util.inherits(Prompt, Base);
  Prompt.prototype._run = function(cb) {
    this.done = cb;
    this.rl.on("keypress", this.onKeypress.bind(this));
    this.rl.on("line", this.onSubmit.bind(this));
    this.render();
    this.hideCursor();
    this.rl.output.mute();
    return this;
  };
  Prompt.prototype.render = function() {
    var message = this.getQuestion();
    var choicesStr = "\n" + this.opt.choices.render(this.pointer);
    if (this.firstRender) {
      message += clc.blackBright("(Press <space> to select)");
    }
    if (this.status === "answered") {
      message += clc.cyan(this.selection.join(", ")) + "\n";
    } else {
      message += choicesStr;
    }
    this.firstRender = false;
    var msgLines = message.split(/\n/);
    this.height = msgLines.length;
    this.rl.setPrompt(_.last(msgLines));
    this.write(message);
    return this;
  };
  Prompt.prototype.onSubmit = function() {
    var choices = this.opt.choices.where({checked: true});
    this.selection = _.pluck(choices, "name");
    var answer = _.pluck(choices, "value");
    this.rl.output.unmute();
    this.showCursor();
    this.validate(answer, function(isValid) {
      if (isValid === true) {
        this.status = "answered";
        this.down().clean(1).render();
        this.rl.removeAllListeners("keypress");
        this.rl.removeAllListeners("line");
        this.done(answer);
      } else {
        this.down().error(isValid).clean().render();
        this.hideCursor();
        this.rl.output.mute();
      }
    }.bind(this));
  };
  Prompt.prototype.onKeypress = function(s, key) {
    var keyWhitelist = ["up", "down", "space", "j", "k"];
    if (key && !_.contains(keyWhitelist, key.name))
      return ;
    if (key && (key.name === "space" || key.name === "j" || key.name === "k"))
      s = undefined;
    if (s && "123456789".indexOf(s) < 0)
      return ;
    var len = this.opt.choices.realLength;
    this.rl.output.unmute();
    var shortcut = Number(s);
    if (shortcut <= len && shortcut > 0) {
      this.pointer = shortcut - 1;
      key = {name: "space"};
    }
    if (key && key.name === "space") {
      var checked = this.opt.choices.getChoice(this.pointer).checked;
      this.opt.choices.getChoice(this.pointer).checked = !checked;
    } else if (key && (key.name === "up" || key.name === "k")) {
      (this.pointer > 0) ? this.pointer-- : (this.pointer = len - 1);
    } else if (key && (key.name === "down" || key.name === "j")) {
      (this.pointer < len - 1) ? this.pointer++ : (this.pointer = 0);
    }
    this.clean().render();
    this.rl.output.mute();
  };
  function renderChoices(pointer) {
    var output = "";
    var separatorOffset = 0;
    this.choices.forEach(function(choice, i) {
      if (choice instanceof Separator) {
        separatorOffset++;
        output += " " + choice + "\n";
        return ;
      }
      var isSelected = (i - separatorOffset === pointer);
      output += isSelected ? clc.cyan(utils.getPointer()) : " ";
      output += utils.getCheckbox(choice.checked, choice.name);
      output += "\n";
    }.bind(this));
    return output.replace(/\n$/, "");
  }
})(require("process"));
