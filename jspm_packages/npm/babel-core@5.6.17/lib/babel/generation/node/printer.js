/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var NodePrinter = (function () {
  function NodePrinter(generator, parent) {
    _classCallCheck(this, NodePrinter);

    this.generator = generator;
    this.parent = parent;
  }

  NodePrinter.prototype.plain = function plain(node, opts) {
    return this.generator.print(node, this.parent, opts);
  };

  NodePrinter.prototype.sequence = function sequence(nodes) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    opts.statement = true;
    return this.generator.printJoin(this, nodes, opts);
  };

  NodePrinter.prototype.join = function join(nodes, opts) {
    return this.generator.printJoin(this, nodes, opts);
  };

  NodePrinter.prototype.list = function list(items) {
    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (opts.separator == null) {
      opts.separator = ",";
      if (!this.generator.format.compact) opts.separator += " ";
    }

    return this.join(items, opts);
  };

  NodePrinter.prototype.block = function block(node) {
    return this.generator.printBlock(this, node);
  };

  NodePrinter.prototype.indentOnComments = function indentOnComments(node) {
    return this.generator.printAndIndentOnComments(this, node);
  };

  return NodePrinter;
})();

exports["default"] = NodePrinter;
module.exports = exports["default"];