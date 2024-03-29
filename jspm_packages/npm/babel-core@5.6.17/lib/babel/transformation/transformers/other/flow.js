/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _types = require("../../../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var metadata = {
  group: "builtin-trailing"
};

exports.metadata = metadata;
var visitor = {
  Program: function Program(node, parent, scope, file) {
    var _arr = file.ast.comments;

    for (var _i = 0; _i < _arr.length; _i++) {
      var comment = _arr[_i];
      if (comment.value.indexOf("@flow") >= 0) {
        comment._displayed = true;
      }
    }
  },

  Flow: function Flow() {
    this.dangerouslyRemove();
  },

  ClassProperty: function ClassProperty(node) {
    node.typeAnnotation = null;
    if (!node.value) this.dangerouslyRemove();
  },

  Class: function Class(node) {
    node["implements"] = null;
  },

  Function: function Function(node) {
    for (var i = 0; i < node.params.length; i++) {
      var param = node.params[i];
      param.optional = false;
    }
  },

  TypeCastExpression: function TypeCastExpression(node) {
    do {
      node = node.expression;
    } while (t.isTypeCastExpression(node));
    return node;
  },

  ImportDeclaration: function ImportDeclaration(node) {
    if (node.isType) this.dangerouslyRemove();
  },

  ExportDeclaration: function ExportDeclaration() {
    if (this.get("declaration").isTypeAlias()) this.dangerouslyRemove();
  }
};
exports.visitor = visitor;