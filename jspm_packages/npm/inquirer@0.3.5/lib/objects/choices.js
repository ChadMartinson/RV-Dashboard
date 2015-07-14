/* */ 
var _ = require("lodash");
var clc = require("cli-color");
var Separator = require("./separator");
var Choice = require("./choice");
module.exports = Choices;
function Choices(choices) {
  this.choices = _.map(choices, function(val) {
    if (val instanceof Separator) {
      return val;
    }
    return new Choice(val);
  });
  this.realChoices = this.choices.filter(Separator.exclude);
  Object.defineProperty(this, "length", {
    get: function() {
      return this.choices.length;
    },
    set: function(val) {
      this.choices.length = val;
    }
  });
  Object.defineProperty(this, "realLength", {
    get: function() {
      return this.realChoices.length;
    },
    set: function() {
      throw new Error("Cannot set `realLength` of a Choices collection");
    }
  });
  this.pointer = 0;
  this.lastIndex = 0;
}
Choices.prototype.getChoice = function(selector) {
  if (_.isNumber(selector)) {
    return this.realChoices[selector];
  }
  return undefined;
};
Choices.prototype.get = function(selector) {
  if (_.isNumber(selector)) {
    return this.choices[selector];
  }
  return undefined;
};
Choices.prototype.where = function(whereClause) {
  return _.where(this.realChoices, whereClause);
};
Choices.prototype.pluck = function(propertyName) {
  return _.pluck(this.realChoices, propertyName);
};
Choices.prototype.forEach = function() {
  return this.choices.forEach.apply(this.choices, arguments);
};
Choices.prototype.filter = function() {
  return this.choices.filter.apply(this.choices, arguments);
};
Choices.prototype.push = function() {
  var objs = _.map(arguments, function(val) {
    return new Choice(val);
  });
  this.choices.push.apply(this.choices, objs);
  this.realChoices = this.choices.filter(Separator.exclude);
  return this.choices;
};
Choices.prototype.render = function() {
  return this.renderingMethod.apply(this, arguments);
};
Choices.prototype.setRender = function(render) {
  this.renderingMethod = (this.choices.length > 9) ? this.paginateOutput(render) : render;
};
Choices.prototype.paginateOutput = function(render) {
  var pageSize = 7;
  return function(active) {
    var output = render.apply(this, arguments);
    var lines = output.split("\n");
    if (lines.length <= pageSize)
      return output;
    if (this.pointer < 3 && this.lastIndex < active && active - this.lastIndex < 9) {
      this.pointer = Math.min(3, this.pointer + active - this.lastIndex);
    }
    this.lastIndex = active;
    var infinite = _.flatten([lines, lines, lines]);
    var topIndex = Math.max(0, active + lines.length - this.pointer);
    var section = infinite.splice(topIndex, pageSize).join("\n");
    return section + "\n" + clc.blackBright("(Move up and down to reveal more choices)");
  }.bind(this);
};
