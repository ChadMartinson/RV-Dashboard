/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;
exports.getBindingIdentifiers = getBindingIdentifiers;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _helpersObject = require("../helpers/object");

var _helpersObject2 = _interopRequireDefault(_helpersObject);

var _index = require("./index");

var t = _interopRequireWildcard(_index);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Return a list of binding identifiers associated with the input `node`.
 */

function getBindingIdentifiers(node, duplicates) {
  var search = [].concat(node);
  var ids = _helpersObject2["default"]();

  while (search.length) {
    var id = search.shift();
    if (!id) continue;

    var key = t.getBindingIdentifiers.keys[id.type];

    if (t.isIdentifier(id)) {
      if (duplicates) {
        var _ids = ids[id.name] = ids[id.name] || [];
        _ids.push(id);
      } else {
        ids[id.name] = id;
      }
    } else if (t.isExportDeclaration(id)) {
      if (t.isDeclaration(node.declaration)) {
        search.push(node.declaration);
      }
    } else if (key && id[key]) {
      search = search.concat(id[key]);
    }
  }

  return ids;
}

getBindingIdentifiers.keys = {
  DeclareClass: "id",
  DeclareFunction: "id",
  DeclareModule: "id",
  DeclareVariable: "id",
  InterfaceDeclaration: "id",
  TypeAlias: "id",

  ComprehensionExpression: "blocks",
  ComprehensionBlock: "left",

  CatchClause: "param",
  LabeledStatement: "label",
  UnaryExpression: "argument",
  AssignmentExpression: "left",

  ImportSpecifier: "local",
  ImportNamespaceSpecifier: "local",
  ImportDefaultSpecifier: "local",
  ImportDeclaration: "specifiers",

  FunctionDeclaration: "id",
  FunctionExpression: "id",

  ClassDeclaration: "id",
  ClassExpression: "id",

  SpreadElement: "argument",
  RestElement: "argument",
  UpdateExpression: "argument",

  SpreadProperty: "argument",
  Property: "value",

  AssignmentPattern: "left",
  ArrayPattern: "elements",
  ObjectPattern: "properties",

  VariableDeclaration: "declarations",
  VariableDeclarator: "id"
};