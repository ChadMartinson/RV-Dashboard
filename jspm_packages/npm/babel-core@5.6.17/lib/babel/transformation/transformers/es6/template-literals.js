/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

/* eslint no-unused-vars: 0 */

var _types = require("../../../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var metadata = {
  group: "builtin-pre"
};

exports.metadata = metadata;
function isString(node) {
  return t.isLiteral(node) && typeof node.value === "string";
}

function buildBinaryExpression(left, right) {
  var node = t.binaryExpression("+", left, right);
  node._templateLiteralProduced = true;
  return node;
}

function crawl(path) {
  if (path.is("_templateLiteralProduced")) {
    crawl(path.get("left"));
    crawl(path.get("right"));
  } else if (!path.isBaseType("string") && !path.isBaseType("number")) {
    path.replaceWith(t.callExpression(t.identifier("String"), [path.node]));
  }
}

var visitor = {
  TaggedTemplateExpression: function TaggedTemplateExpression(node, parent, scope, file) {
    var quasi = node.quasi;
    var args = [];

    var strings = [];
    var raw = [];

    var _arr = quasi.quasis;
    for (var _i = 0; _i < _arr.length; _i++) {
      var elem = _arr[_i];
      strings.push(t.literal(elem.value.cooked));
      raw.push(t.literal(elem.value.raw));
    }

    strings = t.arrayExpression(strings);
    raw = t.arrayExpression(raw);

    var templateName = "tagged-template-literal";
    if (file.isLoose("es6.templateLiterals")) templateName += "-loose";
    args.push(t.callExpression(file.addHelper(templateName), [strings, raw]));

    args = args.concat(quasi.expressions);

    return t.callExpression(node.tag, args);
  },

  TemplateLiteral: function TemplateLiteral(node, parent, scope, file) {
    var nodes = [];

    var _arr2 = node.quasis;
    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var elem = _arr2[_i2];
      nodes.push(t.literal(elem.value.cooked));

      var expr = node.expressions.shift();
      if (expr) nodes.push(expr);
    }

    // filter out empty string literals
    nodes = nodes.filter(function (n) {
      return !t.isLiteral(n, { value: "" });
    });

    // since `+` is left-to-right associative
    // ensure the first node is a string if first/second isn't
    if (!isString(nodes[0]) && !isString(nodes[1])) {
      nodes.unshift(t.literal(""));
    }

    if (nodes.length > 1) {
      var root = buildBinaryExpression(nodes.shift(), nodes.shift());

      var _arr3 = nodes;
      for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
        var _node = _arr3[_i3];
        root = buildBinaryExpression(root, _node);
      }

      this.replaceWith(root);
      //crawl(this);
    } else {
      return nodes[0];
    }
  }
};
exports.visitor = visitor;