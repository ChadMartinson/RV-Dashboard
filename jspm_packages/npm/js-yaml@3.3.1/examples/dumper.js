/* */ 
'use strict';
var yaml = require("../lib/js-yaml");
var object = require("./dumper.json!systemjs-json");
console.log(yaml.dump(object, {
  flowLevel: 3,
  styles: {
    '!!int': 'hexadecimal',
    '!!null': 'camelcase'
  }
}));
