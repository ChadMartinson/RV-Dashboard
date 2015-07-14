/* */ 
var handlebars = require("./handlebars/base"),
    utils = require("./handlebars/utils"),
    compiler = require("./handlebars/compiler/index"),
    runtime = require("./handlebars/runtime");
var create = function() {
  var hb = handlebars.create();
  utils.attach(hb);
  compiler.attach(hb);
  runtime.attach(hb);
  return hb;
};
var Handlebars = create();
Handlebars.create = create;
module.exports = Handlebars;
if (require.extensions) {
  var extension = function(module, filename) {
    var fs = require("fs");
    var templateString = fs.readFileSync(filename, "utf8");
    module.exports = Handlebars.compile(templateString);
  };
  require.extensions[".handlebars"] = extension;
  require.extensions[".hbs"] = extension;
}
