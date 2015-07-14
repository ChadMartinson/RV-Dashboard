/* */ 
var handlebars = require("./parser");
exports.attach = function(Handlebars) {
  Handlebars.Parser = handlebars;
  Handlebars.parse = function(input) {
    if (input.constructor === Handlebars.AST.ProgramNode) {
      return input;
    }
    Handlebars.Parser.yy = Handlebars.AST;
    return Handlebars.Parser.parse(input);
  };
  return Handlebars;
};
