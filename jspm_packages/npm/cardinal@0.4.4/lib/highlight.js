/* */ 
var redeyed = require("redeyed"),
    theme = require("../themes/default"),
    colors = require("ansicolors"),
    colorSurround = colors.brightBlack,
    surroundClose = '\u001b[39m';
;
function trimEmptyLines(lines) {
  var line = lines.pop();
  while (!line || !line.length)
    line = lines.pop();
  if (line)
    lines.push(line);
}
function addLinenos(highlightedCode, firstline) {
  var highlightedLines = highlightedCode.split('\n');
  trimEmptyLines(highlightedLines);
  var linesLen = highlightedLines.length,
      lines = [],
      totalDigits,
      lineno;
  ;
  function getDigits(n) {
    if (n < 10)
      return 1;
    if (n < 100)
      return 2;
    if (n < 1000)
      return 3;
    if (n < 10000)
      return 4;
    return 5;
  }
  function pad(n, totalDigits) {
    var padDigits = totalDigits - getDigits(n);
    switch (padDigits) {
      case 0:
        return '' + n;
      case 1:
        return ' ' + n;
      case 2:
        return '  ' + n;
      case 3:
        return '   ' + n;
      case 4:
        return '    ' + n;
      case 5:
        return '     ' + n;
    }
  }
  totalDigits = getDigits(linesLen + firstline - 1);
  for (var i = 0; i < linesLen; i++) {
    lineno = colorSurround(pad(i + firstline, totalDigits) + ': ').replace(surroundClose, '');
    lines.push(lineno + highlightedLines[i]);
  }
  return lines.join('\n');
}
module.exports = function highlight(code, opts) {
  opts = opts || {};
  if (opts.json) {
    code = '!\n' + code;
  }
  try {
    var result = redeyed(code, opts.theme || theme),
        firstline = opts.firstline && !isNaN(opts.firstline) ? opts.firstline : 1;
    if (opts.json) {
      result.code = result.code.split('\n').slice(1).join('\n');
    }
    return opts.linenos ? addLinenos(result.code, firstline) : result.code;
  } catch (e) {
    e.message = 'Unable to perform highlight. The code contained syntax errors: ' + e.message;
    throw e;
  }
};
