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
    this.selected = 0;
    var def = this.opt.default;
    if (_.isNumber(def) && def >= 0 && def < this.opt.choices.realLength) {
      this.selected = def;
    }
    this.opt.choices.setRender(listRender);
    this.opt.default = null;
    return this;
  }
  util.inherits(Prompt, Base);
  Prompt.prototype._run = function(cb) {
    this.done = cb;
    this.rl.on("keypress", this.onKeypress.bind(this));
    this.rl.once("line", this.onSubmit.bind(this));
    this.render();
    this.hideCursor();
    this.rl.output.mute();
    return this;
  };
  Prompt.prototype.render = function() {
    var message = this.getQuestion();
    var choicesStr = "\n" + this.opt.choices.render(this.selected);
    if (this.firstRender) {
      message += clc.blackBright("(Use arrow keys)");
    }
    if (this.status === "answered") {
      message += clc.cyan(this.opt.choices.getChoice(this.selected).name) + "\n";
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
    var choice = this.opt.choices.getChoice(this.selected);
    this.status = "answered";
    this.rl.output.unmute();
    this.clean().render();
    this.showCursor();
    this.rl.removeAllListeners("keypress");
    this.done(choice.value);
  };
  Prompt.prototype.onKeypress = function(s, key) {
    var keyWhitelist = ["up", "down", "j", "k"];
    if (key && !_.contains(keyWhitelist, key.name))
      return ;
    if (key && (key.name === "j" || key.name === "k"))
      s = undefined;
    if (s && "123456789".indexOf(s) < 0)
      return ;
    this.rl.output.unmute();
    var len = this.opt.choices.realLength;
    if (key && (key.name === "up" || key.name === "k")) {
      (this.selected > 0) ? this.selected-- : (this.selected = len - 1);
    } else if (key && (key.name === "down" || key.name === "j")) {
      (this.selected < len - 1) ? this.selected++ : (this.selected = 0);
    } else if (Number(s) <= len) {
      this.selected = Number(s) - 1;
    }
    this.clean().render();
    this.rl.output.mute();
  };
  function listRender(pointer) {
    var output = "";
    var separatorOffset = 0;
    this.choices.forEach(function(choice, i) {
      if (choice instanceof Separator) {
        separatorOffset++;
        output += "  " + choice + "\n";
        return ;
      }
      var isSelected = (i - separatorOffset === pointer);
      var line = (isSelected ? utils.getPointer() + " " : "  ") + choice.name;
      if (isSelected) {
        line = clc.cyan(line);
      }
      output += line + " \n";
    }.bind(this));
    return output.replace(/\n$/, "");
  }
})(require("process"));
