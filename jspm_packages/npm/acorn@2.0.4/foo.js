/* */ 
var acorn = require("./dist/acorn"),
    walk = require("./dist/walk");
var ast = acorn.parse("function foo(...x) {}", {ecmaVersion: 6});
function log(type) {
  return function(node) {
    console.log("saw", type, node.type);
  };
}
walk.simple(ast, {
  Expression: log("expression"),
  Statement: log("statement"),
  Pattern: log("pattern")
});
