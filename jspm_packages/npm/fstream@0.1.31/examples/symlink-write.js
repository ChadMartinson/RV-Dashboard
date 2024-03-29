/* */ 
(function(process) {
  var fstream = require("../fstream"),
      closed = false;
  fstream.Writer({
    path: "path/to/symlink",
    linkpath: "./file",
    isSymbolicLink: true,
    mode: "0755"
  }).on("close", function() {
    closed = true;
    var fs = require("fs");
    var s = fs.lstatSync("path/to/symlink");
    var isSym = s.isSymbolicLink();
    console.log((isSym ? "" : "not ") + "ok 1 should be symlink");
    var t = fs.readlinkSync("path/to/symlink");
    var isTarget = t === "./file";
    console.log((isTarget ? "" : "not ") + "ok 2 should link to ./file");
  }).end();
  process.on("exit", function() {
    console.log((closed ? "" : "not ") + "ok 3 should be closed");
  });
})(require("process"));
