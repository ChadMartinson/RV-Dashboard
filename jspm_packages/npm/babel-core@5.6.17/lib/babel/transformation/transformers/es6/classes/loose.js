/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _vanilla = require("./vanilla");

var _vanilla2 = _interopRequireDefault(_vanilla);

var _types = require("../../../../types");

var t = _interopRequireWildcard(_types);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var LooseClassTransformer = (function (_VanillaTransformer) {
  function LooseClassTransformer() {
    _classCallCheck(this, LooseClassTransformer);

    _VanillaTransformer.apply(this, arguments);
    this.isLoose = true;
  }

  _inherits(LooseClassTransformer, _VanillaTransformer);

  LooseClassTransformer.prototype._processMethod = function _processMethod(node) {
    if (!node.decorators) {
      // use assignments instead of define properties for loose classes

      var classRef = this.classRef;
      if (!node["static"]) classRef = t.memberExpression(classRef, t.identifier("prototype"));
      var methodName = t.memberExpression(classRef, node.key, node.computed || t.isLiteral(node.key));

      var expr = t.expressionStatement(t.assignmentExpression("=", methodName, node.value));
      t.inheritsComments(expr, node);
      this.body.push(expr);
      return true;
    }
  };

  return LooseClassTransformer;
})(_vanilla2["default"]);

exports["default"] = LooseClassTransformer;
module.exports = exports["default"];