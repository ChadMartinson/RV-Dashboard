/* */ 
(function(process) {
  var _ = require("lodash");
  var async = require("async");
  var clc = require("cli-color");
  var readlineFacade = require("./utils/readline");
  var utils = require("./utils/utils");
  var inquirer = module.exports;
  inquirer.prompts = {
    list: require("./prompts/list"),
    input: require("./prompts/input"),
    confirm: require("./prompts/confirm"),
    rawlist: require("./prompts/rawlist"),
    expand: require("./prompts/expand"),
    checkbox: require("./prompts/checkbox"),
    password: require("./prompts/password")
  };
  inquirer.Separator = require("./objects/separator");
  inquirer.prompt = function(questions, allDone) {
    var self = this;
    this.rl || (this.rl = readlineFacade.createInterface());
    this.rl.resume();
    this.answers = {};
    if (!_.isArray(questions)) {
      questions = [questions];
    }
    process.stdin.on("keypress", this.onKeypress);
    self.rl.on("SIGINT", this.onForceClose);
    var onCompletion = function() {
      this.rl.removeListener("SIGINT", this.onForceClose);
      process.stdin.removeListener("keypress", this.onKeypress);
      this.rl.output.end();
      this.rl.pause();
      this.rl.close();
      this.rl = null;
      if (_.isFunction(allDone)) {
        allDone(this.answers);
      }
    }.bind(this);
    var onEach = function(question, done) {
      var after = function(answer) {
        this.answers[question.name] = answer;
        done(null);
      }.bind(this);
      if (!this.prompts[question.type]) {
        question.type = "input";
      }
      if (_.isFunction(question.default)) {
        question.default = question.default(this.answers);
      }
      if (_.isFunction(question.choices)) {
        question.choices = question.choices(this.answers);
      }
      var prompt = new this.prompts[question.type](question, this.rl);
      utils.runAsync(prompt.opt.when, function(continu) {
        if (continu) {
          prompt.run(after);
        } else {
          done(null);
        }
      }, this.answers);
    }.bind(this);
    async.mapSeries(questions, onEach, onCompletion);
  };
  inquirer.onKeypress = function(s, key) {
    if (key && (key.name === "enter" || key.name === "return"))
      return ;
    if (this.rl) {
      this.rl.emit("keypress", s, key);
    }
  }.bind(inquirer);
  inquirer.onForceClose = function() {
    this.rl.output.unmute();
    process.stdout.write("\033[?25h");
    this.rl.close();
    console.log("\n");
  }.bind(inquirer);
})(require("process"));
