/* */ 
'use strict';
var fs = require("fs"),
    path = require("path"),
    utl = require("../utl"),
    highlighter = require("../cardinal"),
    colors = require("ansicolors"),
    diffFile = path.join(__dirname, 'fixtures', 'git-diff.txt'),
    diff = fs.readFileSync(diffFile, 'utf-8');
var diffRegex = /^@@[^@]+@@$/m;
var diffIndRegex = /^(@@[^@]+@@)(.*)$/;
var addRemRegex = /^[+\-]/;
var lines = diff.split('\n');
function isDiff(lines) {
  return !!lines.filter(function(line) {
    return diffRegex.test(line);
  }).length;
}
var diff = isDiff(lines);
function tryHighlight(code) {
  function tryAppending(appended, tryNext) {
    try {
      return highlighter.highlight(code + appended);
    } catch (e) {
      return tryNext(code);
    }
  }
  function tryRemoveLeadingComma(tryNext) {
    var success;
    try {
      success = highlighter.highlight(code.replace(/^( +),(.+)$/, '$1 $2'));
      return success;
    } catch (e) {
      return tryNext(code);
    }
  }
  function tryPlain() {
    try {
      return highlighter.highlight(code);
    } catch (e) {
      return tryCloseMustache();
    }
  }
  function tryCloseMustache() {
    return tryAppending('}', tryCloseParen);
  }
  function tryCloseParen() {
    return tryAppending('\\)', tryCloseMustacheParen);
  }
  function tryCloseMustacheParen() {
    return tryAppending('})', tryRemovingCommas);
  }
  function tryRemovingCommas() {
    return tryRemoveLeadingComma(giveUp);
  }
  function giveUp() {
    return code;
  }
  return tryPlain();
}
function highlightDiffInd(line, matches) {
  var highlighted = colors.brightBlue(matches[1]),
      code = matches[2];
  return code ? highlighted + tryHighlight(code) : highlighted;
}
function colorsAddRemove(c) {
  return addRemRegex.test(c) ? colors.yellow(c) : c;
}
function highlightDiff(line) {
  var diffIndMatches = diffIndRegex.exec(line);
  return diffIndMatches ? highlightDiffInd(line, diffIndMatches) : colorsAddRemove(line[0]) + tryHighlight(line.slice(1));
}
var highlightFn = diff ? highlightDiff : tryHighlight;
var highlightedLines = lines.map(highlightFn);
console.log(highlightedLines.join('\n'));
