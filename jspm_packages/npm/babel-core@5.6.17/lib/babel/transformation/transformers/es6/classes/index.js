/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _loose = require("./loose");

var _loose2 = _interopRequireDefault(_loose);

var _vanilla = require("./vanilla");

var _vanilla2 = _interopRequireDefault(_vanilla);

var _types = require("../../../../types");

var t = _interopRequireWildcard(_types);

var _helpersNameMethod = require("../../../helpers/name-method");

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var visitor = {
  ClassDeclaration: function ClassDeclaration(node) {
    return t.variableDeclaration("let", [t.variableDeclarator(node.id, t.toExpression(node))]);
  },

  ClassExpression: function ClassExpression(node, parent, scope, file) {
    var inferred = _helpersNameMethod.bare(node, parent, scope);
    if (inferred) return inferred;

    if (file.isLoose("es6.classes")) {
      return new _loose2["default"](this, file).run();
    } else {
      return new _vanilla2["default"](this, file).run();
    }
  }
};
exports.visitor = visitor;