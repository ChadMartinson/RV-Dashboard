/* */ 
var fs = require("fs"),
    join = require("path").join,
    spawn = require("./spawn-sync");
var unsafe = spawn.arg;
try {
  var result = spawn.tmpFunction({unsafeCleanup: unsafe});
  try {
    var fd = fs.openSync(join(result.name, 'should-be-removed.file'), 'w');
    fs.closeSync(fd);
    var symlinkSource = join(__dirname, 'symlinkme');
    var symlinkTarget = join(result.name, 'symlinkme-target');
    fs.symlinkSync(symlinkSource, symlinkTarget, 'dir');
    spawn.out(result.name, spawn.exit);
  } catch (e) {
    spawn.err(e.toString(), spawn.exit);
  }
} catch (e) {
  spawn.err(err, spawn.exit);
}
