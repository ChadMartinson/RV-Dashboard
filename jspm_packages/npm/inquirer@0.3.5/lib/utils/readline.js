/* */ 
(function(process) {
  "use strict";
  var _ = require("lodash");
  var readline = require("readline");
  var MuteStream = require("mute-stream");
  var ansiTrim = require("cli-color/lib/trim");
  var Interface = module.exports = {};
  Interface.createInterface = function(opt) {
    opt || (opt = {});
    var filteredOpt = opt;
    filteredOpt.input = opt.input || process.stdin;
    var ms = new MuteStream();
    ms.pipe(opt.output || process.stdout);
    filteredOpt.output = ms;
    var rl = readline.createInterface(filteredOpt);
    rl._refreshLine = _.wrap(rl._refreshLine, function(func) {
      func.call(rl);
      var line = this._prompt + this.line;
      var cursorPos = this._getCursorPos();
      readline.moveCursor(this.output, -line.length, 0);
      readline.moveCursor(this.output, cursorPos.cols, 0);
    });
    rl._getCursorPos = function() {
      var columns = this.columns;
      var strBeforeCursor = this._prompt + this.line.substring(0, this.cursor);
      var dispPos = this._getDisplayPos(ansiTrim(strBeforeCursor));
      var cols = dispPos.cols;
      var rows = dispPos.rows;
      if (cols + 1 === columns && this.cursor < this.line.length && isFullWidthCodePoint(codePointAt(this.line, this.cursor))) {
        rows++;
        cols = 0;
      }
      return {
        cols: cols,
        rows: rows
      };
    };
    rl._getDisplayPos = function(str) {
      var offset = 0;
      var col = this.columns;
      var code;
      str = ansiTrim(str);
      for (var i = 0,
          len = str.length; i < len; i++) {
        code = codePointAt(str, i);
        if (code >= 0x10000) {
          i++;
        }
        if (isFullWidthCodePoint(code)) {
          if ((offset + 1) % col === 0) {
            offset++;
          }
          offset += 2;
        } else {
          offset++;
        }
      }
      var cols = offset % col;
      var rows = (offset - cols) / col;
      return {
        cols: cols,
        rows: rows
      };
    };
    var origWrite = rl._ttyWrite;
    rl._ttyWrite = function(s, key) {
      key || (key = {});
      if (key.name === "up")
        return ;
      if (key.name === "down")
        return ;
      origWrite.apply(this, arguments);
    };
    return rl;
  };
  function codePointAt(str, index) {
    var code = str.charCodeAt(index);
    var low;
    if (0xd800 <= code && code <= 0xdbff) {
      low = str.charCodeAt(index + 1);
      if (!isNaN(low)) {
        code = 0x10000 + (code - 0xd800) * 0x400 + (low - 0xdc00);
      }
    }
    return code;
  }
  function isFullWidthCodePoint(code) {
    if (isNaN(code)) {
      return false;
    }
    if (code >= 0x1100 && (code <= 0x115f || 0x2329 === code || 0x232a === code || (0x2e80 <= code && code <= 0x3247 && code !== 0x303f) || 0x3250 <= code && code <= 0x4dbf || 0x4e00 <= code && code <= 0xa4c6 || 0xa960 <= code && code <= 0xa97c || 0xac00 <= code && code <= 0xd7a3 || 0xf900 <= code && code <= 0xfaff || 0xfe10 <= code && code <= 0xfe19 || 0xfe30 <= code && code <= 0xfe6b || 0xff01 <= code && code <= 0xff60 || 0xffe0 <= code && code <= 0xffe6 || 0x1b000 <= code && code <= 0x1b001 || 0x1f200 <= code && code <= 0x1f251 || 0x20000 <= code && code <= 0x3fffd)) {
      return true;
    }
    return false;
  }
})(require("process"));
