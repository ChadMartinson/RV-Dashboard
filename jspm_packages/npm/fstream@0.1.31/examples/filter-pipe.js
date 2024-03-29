/* */ 
(function(process) {
  var fstream = require("../fstream");
  var path = require("path");
  var r = fstream.Reader({
    path: path.dirname(__dirname),
    filter: function() {
      return !this.basename.match(/^\./) && !this.basename.match(/^node_modules$/);
      !this.basename.match(/^deep-copy$/);
      !this.basename.match(/^filter-copy$/);
    }
  });
  var w = fstream.Writer({
    path: path.resolve(__dirname, "filter-copy"),
    type: "Directory",
    filter: function() {
      return this.type === "Directory";
    }
  });
  var indent = "";
  var escape = {};
  r.on("entry", appears);
  r.on("ready", function() {
    console.error("ready to begin!", r.path);
  });
  function appears(entry) {
    console.error(indent + "a %s appears!", entry.type, entry.basename, typeof entry.basename);
    if (foggy) {
      console.error("FOGGY!");
      var p = entry;
      do {
        console.error(p.depth, p.path, p._paused);
      } while (p = p.parent);
      throw new Error("\033[mshould not have entries while foggy");
    }
    indent += "\t";
    entry.on("data", missile(entry));
    entry.on("end", runaway(entry));
    entry.on("entry", appears);
  }
  var foggy;
  function missile(entry) {
    if (entry.type === "Directory") {
      var ended = false;
      entry.once("end", function() {
        ended = true;
      });
      return function(c) {
        process.nextTick(function() {
          if (!foggy && !ended) {
            console.error(indent + "%s casts a spell", entry.basename);
            console.error("\na slowing fog comes over the battlefield...\n\033[32m");
            entry.pause();
            entry.once("resume", liftFog);
            foggy = setTimeout(liftFog, 1000);
            function liftFog(who) {
              if (!foggy)
                return ;
              if (who) {
                console.error("%s breaks the spell!", who && who.path);
              } else {
                console.error("the spell expires!");
              }
              console.error("\033[mthe fog lifts!\n");
              clearTimeout(foggy);
              foggy = null;
              if (entry._paused)
                entry.resume();
            }
          }
        });
      };
    }
    return function(c) {
      var e = Math.random() < 0.5;
      console.error(indent + "%s %s for %d damage!", entry.basename, e ? "is struck" : "fires a chunk", c.length);
    };
  }
  function runaway(entry) {
    return function() {
      var e = Math.random() < 0.5;
      console.error(indent + "%s %s", entry.basename, e ? "turns to flee" : "is vanquished!");
      indent = indent.slice(0, -1);
    };
  }
  w.on("entry", attacks);
  function attacks(entry) {
    console.error(indent + "%s %s!", entry.basename, entry.type === "Directory" ? "calls for backup" : "attacks");
    entry.on("entry", attacks);
  }
  ended = false;
  var i = 1;
  r.on("end", function() {
    if (foggy)
      clearTimeout(foggy);
    console.error("\033[mIT'S OVER!!");
    console.error("A WINNAR IS YOU!");
    console.log("ok " + (i++) + " A WINNAR IS YOU");
    ended = true;
    var p = path.resolve(__dirname, "filter-copy");
    var checker = fstream.Reader({path: p});
    checker.checker = true;
    checker.on("child", function(e) {
      var ok = e.type === "Directory";
      console.log((ok ? "" : "not ") + "ok " + (i++) + " should be a dir: " + e.path.substr(checker.path.length + 1));
    });
  });
  process.on("exit", function() {
    console.log((ended ? "" : "not ") + "ok " + (i++) + " ended");
  });
  r.pipe(w);
})(require("process"));
