/* */ 
module.exports.attach = function(Handlebars) {
  var visitor = require("./visitor"),
      printer = require("./printer"),
      ast = require("./ast"),
      compiler = require("./compiler");
  visitor.attach(Handlebars);
  printer.attach(Handlebars);
  ast.attach(Handlebars);
  compiler.attach(Handlebars);
  return Handlebars;
};
