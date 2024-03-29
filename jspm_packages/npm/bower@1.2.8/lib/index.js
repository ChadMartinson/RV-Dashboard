/* */ 
var abbrev = require("abbrev");
var mout = require("mout");
var commands = require("./commands/index");
var PackageRepository = require("./core/PackageRepository");
var abbreviations = abbrev(expandNames(commands));
abbreviations.i = 'install';
abbreviations.rm = 'uninstall';
abbreviations.ls = 'list';
function expandNames(obj, prefix, stack) {
  prefix = prefix || '';
  stack = stack || [];
  mout.object.forOwn(obj, function(value, name) {
    name = prefix + name;
    stack.push(name);
    if (typeof value === 'object' && !value.line) {
      expandNames(value, name + ' ', stack);
    }
  });
  return stack;
}
function clearRuntimeCache() {
  PackageRepository.clearRuntimeCache();
}
module.exports = {
  commands: commands,
  config: require("./config"),
  abbreviations: abbreviations,
  reset: clearRuntimeCache
};
