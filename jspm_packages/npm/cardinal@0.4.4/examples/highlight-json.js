/* */ 
var cardinal = require("../cardinal");
var json = JSON.stringify({
  foo: 'bar',
  baz: 'quux'
});
console.log(cardinal.highlight(json, {json: true}));
