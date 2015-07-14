/* */ 
var _ = require("lodash");
var clc = require("cli-color");
var ansiTrim = require("cli-color/lib/trim");
var readline = require("readline");
var utils = require("../utils/utils");
var Choices = require("../objects/choices");
module.exports = Prompt;
function Prompt(question, rl) {
  _.assign(this, {
    height: 0,
    status: "pending"
  });
  this.opt = _.defaults(_.clone(question), {
    validate: function() {
      return true;
    },
    filter: function(val) {
      return val;
    },
    when: function() {
      return true;
    }
  });
  if (!this.opt.message) {
    this.throwParamError("message");
  }
  if (!this.opt.name) {
    this.throwParamError("name");
  }
  if (_.isArray(this.opt.choices)) {
    this.opt.choices = new Choices(this.opt.choices);
  }
  this.rl = rl;
  return this;
}
Prompt.prototype.run = function(cb) {
  var self = this;
  this._run(function(value) {
    self.filter(value, cb);
  });
  return this;
};
Prompt.prototype._run = function(cb) {
  cb();
};
Prompt.prototype.throwParamError = function(name) {
  throw new Error("You must provide a `" + name + "` parameter");
};
Prompt.prototype.clean = function(extra) {
  _.isNumber(extra) || (extra = 0);
  var len = this.height + extra;
  while (len--) {
    readline.moveCursor(this.rl.output, -clc.width, 0);
    readline.clearLine(this.rl.output, 0);
    if (len)
      readline.moveCursor(this.rl.output, 0, -1);
  }
  return this;
};
Prompt.prototype.down = function(x) {
  _.isNumber(x) || (x = 1);
  while (x--) {
    this.write("\n");
  }
  return this;
};
Prompt.prototype.up = function(x) {
  _.isNumber(x) || (x = 1);
  readline.moveCursor(this.rl.output, 0, -x);
  return this;
};
Prompt.prototype.error = function(error) {
  readline.moveCursor(this.rl.output, -clc.width, 0);
  readline.clearLine(this.rl.output, 0);
  var errMsg = clc.red(">> ") + (error || "Please enter a valid value");
  this.write(errMsg);
  return this.up();
};
Prompt.prototype.hint = function(hint) {
  readline.moveCursor(this.rl.output, -clc.width, 0);
  readline.clearLine(this.rl.output, 0);
  if (hint.length) {
    var hintMsg = clc.cyan(">> ") + hint;
    this.write(hintMsg);
  }
  return this.up();
};
Prompt.prototype.validate = function(input, cb) {
  utils.runAsync(this.opt.validate, cb, input);
};
Prompt.prototype.filter = function(input, cb) {
  utils.runAsync(this.opt.filter, cb, input);
};
Prompt.prototype.prefix = function(str) {
  str || (str = "");
  return "[" + clc.green("?") + "] " + str;
};
Prompt.prototype.suffix = function(str) {
  str || (str = "");
  return (str.length < 1 || /([a-z])$/i.test(str) ? str + ":" : str).trim() + " ";
};
Prompt.prototype.getQuestion = function() {
  var message = _.compose(this.prefix, this.suffix)(this.opt.message);
  if (this.opt.default && this.status !== "answered") {
    message += "(" + this.opt.default + ") ";
  }
  return message;
};
Prompt.prototype.write = function(str) {
  this.rl.output.write(str);
  return this;
};
Prompt.prototype.hideCursor = function() {
  return this.write("\033[?25l");
};
Prompt.prototype.showCursor = function() {
  return this.write("\033[?25h");
};
Prompt.prototype.cacheCursorPos = function() {
  this.cursorPos = this.rl._getCursorPos();
  return this;
};
Prompt.prototype.restoreCursorPos = function() {
  if (!this.cursorPos)
    return ;
  var line = this.rl._prompt + this.rl.line;
  readline.moveCursor(this.rl.output, -line.length, 0);
  readline.moveCursor(this.rl.output, this.cursorPos.cols, 0);
  this.cursorPos = null;
  return this;
};
