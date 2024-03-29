/* */ 
"format cjs";
"use strict";

var _toolsProtectJs2 = require("./../tools/protect.js");

var _toolsProtectJs3 = _interopRequireDefault(_toolsProtectJs2);

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _normalizeAst = require("./normalize-ast");

var _normalizeAst2 = _interopRequireDefault(_normalizeAst);

var _estraverse = require("estraverse");

var _estraverse2 = _interopRequireDefault(_estraverse);

var _acorn = require("../../acorn");

var acorn = _interopRequireWildcard(_acorn);

_toolsProtectJs3["default"](module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

exports["default"] = function (code) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var commentsAndTokens = [];
  var comments = [];
  var tokens = [];

  var parseOpts = {
    allowImportExportEverywhere: opts.looseModules,
    allowReturnOutsideFunction: opts.looseModules,
    allowHashBang: true,
    ecmaVersion: 6,
    strictMode: opts.strictMode,
    sourceType: opts.sourceType,
    locations: true,
    features: opts.features || {},
    plugins: opts.plugins || {},
    onToken: tokens,
    ranges: true
  };

  parseOpts.onToken = function (token) {
    tokens.push(token);
    commentsAndTokens.push(token);
  };

  parseOpts.onComment = function (block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "CommentBlock" : "CommentLine",
      value: text,
      start: start,
      end: end,
      loc: new acorn.SourceLocation(this, startLoc, endLoc),
      range: [start, end]
    };

    commentsAndTokens.push(comment);
    comments.push(comment);
  };

  if (opts.nonStandard) {
    parseOpts.plugins.jsx = true;
    parseOpts.plugins.flow = true;
  }

  var ast = acorn.parse(code, parseOpts);
  _estraverse2["default"].attachComments(ast, comments, tokens);
  ast = _normalizeAst2["default"](ast, comments, commentsAndTokens);
  return ast;
};

module.exports = exports["default"];