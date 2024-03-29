/* */ 
(function(process) {
  var fstream = require("../fstream");
  var tap = require("tap");
  var fs = require("fs");
  var path = require("path");
  var children = -1;
  var dir = path.dirname(__dirname);
  var gotReady = false;
  var ended = false;
  tap.test("reader test", function(t) {
    var r = fstream.Reader({
      path: dir,
      filter: function() {
        return this.parent === r || this === r;
      }
    });
    r.on("ready", function() {
      gotReady = true;
      children = fs.readdirSync(dir).length;
      console.error("Setting expected children to " + children);
      t.equal(r.type, "Directory", "should be a directory");
    });
    r.on("entry", function(entry) {
      children--;
      if (!gotReady) {
        t.fail("children before ready!");
      }
      t.equal(entry.dirname, r.path, "basename is parent dir");
    });
    r.on("error", function(er) {
      t.fail(er);
      t.end();
      process.exit(1);
    });
    r.on("end", function() {
      t.equal(children, 0, "should have seen all children");
      ended = true;
    });
    var closed = false;
    r.on("close", function() {
      t.ok(ended, "saw end before close");
      t.notOk(closed, "close should only happen once");
      closed = true;
      t.end();
    });
  });
})(require("process"));
