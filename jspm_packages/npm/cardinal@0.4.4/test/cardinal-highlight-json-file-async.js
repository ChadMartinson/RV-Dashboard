/* */ 
'use strict';
var test = require("tap").test,
    util = require("util"),
    path = require("path"),
    cardinal = require("../cardinal");
function inspect(obj) {
  return console.log(util.inspect(obj, false, 5, false));
}
var file = path.join(__dirname, 'fixtures/json.json');
test('json option set from extension', function(t) {
  cardinal.highlightFile(file, function(err, highlighted) {
    t.equals(null, err, 'no error');
    t.equals(highlighted, '\u001b[33m{\u001b[39m\u001b[32m"foo"\u001b[39m\u001b[93m:\u001b[39m\u001b[92m"bar"\u001b[39m\u001b[32m,\u001b[39m\u001b[32m"baz"\u001b[39m\u001b[93m:\u001b[39m\u001b[92m"quux"\u001b[39m\u001b[32m,\u001b[39m\u001b[32m"bam"\u001b[39m\u001b[93m:\u001b[39m\u001b[90mnull\u001b[39m\u001b[33m}\u001b[39m');
    t.end();
  });
});
test('json option respected if false', function(t) {
  cardinal.highlightFile(file, {json: false}, function(err, highlighted) {
    t.similar(err.message, /Unable to perform highlight. The code contained syntax errors.* Line 1: Unexpected token /);
    t.end();
  });
});
