/* */ 
(function(process) {
  var fs = require("fs"),
      path = require("path"),
      symlink = path.resolve(__dirname, "fixtures/symlink");
  try {
    fs.unlinkSync(symlink);
  } catch (e) {}
  fs.symlinkSync("./hardlink-1", symlink);
  process.on("exit", function() {
    fs.unlinkSync(symlink);
  });
  var tap = require("tap"),
      tar = require("../tar"),
      pkg = require("../package.json!systemjs-json"),
      Pack = tar.Pack,
      fstream = require("fstream"),
      Reader = fstream.Reader,
      Writer = fstream.Writer,
      input = path.resolve(__dirname, "fixtures/"),
      target = path.resolve(__dirname, "tmp/pack.tar"),
      uid = process.getuid ? process.getuid() : 0,
      gid = process.getgid ? process.getgid() : 0,
      entries = [['globalExtendedHeader', {
        path: 'PaxHeader/',
        mode: 438,
        uid: 0,
        gid: 0,
        type: 'g',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }, {
        "NODETAR.author": pkg.author,
        "NODETAR.name": pkg.name,
        "NODETAR.description": pkg.description,
        "NODETAR.version": pkg.version,
        "NODETAR.repository.type": pkg.repository.type,
        "NODETAR.repository.url": pkg.repository.url,
        "NODETAR.main": pkg.main,
        "NODETAR.scripts.test": pkg.scripts.test
      }], ['entry', {
        path: 'fixtures/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['extendedHeader', {
        path: 'PaxHeader/fixtures/200cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        mode: 420,
        uid: uid,
        gid: gid,
        type: 'x',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }, {
        path: 'fixtures/200ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        'NODETAR.depth': '1',
        'NODETAR.type': 'File',
        nlink: 1,
        uid: uid,
        gid: gid,
        size: 200,
        'NODETAR.blksize': '4096',
        'NODETAR.blocks': '8'
      }], ['entry', {
        path: 'fixtures/200ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 200,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: '',
        'NODETAR.depth': '1',
        'NODETAR.type': 'File',
        nlink: 1,
        'NODETAR.blksize': '4096',
        'NODETAR.blocks': '8'
      }], ['entry', {
        path: 'fixtures/a.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 257,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/b.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 512,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/c.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 513,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/cc.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 513,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/foo.js',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 4,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/hardlink-1',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 200,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/hardlink-2',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 0,
        type: '1',
        linkpath: 'fixtures/hardlink-1',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/omega.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 2,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/packtest/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/packtest/omega.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 2,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/packtest/star.4.html',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 54081,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['extendedHeader', {
        path: 'PaxHeader/fixtures/packtest/Ω.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        type: 'x',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }, {
        path: 'fixtures/packtest/Ω.txt',
        'NODETAR.depth': '2',
        'NODETAR.type': 'File',
        nlink: 1,
        uid: uid,
        gid: gid,
        size: 2,
        'NODETAR.blksize': '4096',
        'NODETAR.blocks': '8'
      }], ['entry', {
        path: 'fixtures/packtest/Ω.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 2,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: '',
        'NODETAR.depth': '2',
        'NODETAR.type': 'File',
        nlink: 1,
        'NODETAR.blksize': '4096',
        'NODETAR.blocks': '8'
      }], ['entry', {
        path: 'fixtures/r/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/p/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/p/a/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/p/a/t/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/p/a/t/h/',
        mode: 493,
        uid: uid,
        gid: gid,
        size: 0,
        type: '5',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/r/e/a/l/l/y/-/d/e/e/p/-/f/o/l/d/e/r/-/p/a/t/h/cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 100,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['entry', {
        path: 'fixtures/symlink',
        uid: uid,
        gid: gid,
        size: 0,
        type: '2',
        linkpath: 'hardlink-1',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }], ['extendedHeader', {
        path: 'PaxHeader/fixtures/Ω.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        type: 'x',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: ''
      }, {
        path: "fixtures/Ω.txt",
        "NODETAR.depth": "1",
        "NODETAR.type": "File",
        nlink: 1,
        uid: uid,
        gid: gid,
        size: 2,
        "NODETAR.blksize": "4096",
        "NODETAR.blocks": "8"
      }], ['entry', {
        path: 'fixtures/Ω.txt',
        mode: 420,
        uid: uid,
        gid: gid,
        size: 2,
        type: '0',
        linkpath: '',
        ustar: 'ustar\u0000',
        ustarver: '00',
        uname: '',
        gname: '',
        devmaj: 0,
        devmin: 0,
        fill: '',
        'NODETAR.depth': '1',
        'NODETAR.type': 'File',
        nlink: 1,
        'NODETAR.blksize': '4096',
        'NODETAR.blocks': '8'
      }]];
  var hard1 = path.resolve(__dirname, "fixtures/hardlink-1"),
      hard2 = path.resolve(__dirname, "fixtures/hardlink-2"),
      fs = require("fs");
  try {
    fs.unlinkSync(hard2);
  } catch (e) {}
  fs.linkSync(hard1, hard2);
  tap.test("with global header", {timeout: 10000}, function(t) {
    runTest(t, true);
  });
  tap.test("without global header", {timeout: 10000}, function(t) {
    runTest(t, false);
  });
  function alphasort(a, b) {
    return a === b ? 0 : a.toLowerCase() > b.toLowerCase() ? 1 : a.toLowerCase() < b.toLowerCase() ? -1 : a > b ? 1 : -1;
  }
  function runTest(t, doGH) {
    var reader = Reader({
      path: input,
      filter: function() {
        return !this.path.match(/\.(tar|hex)$/);
      },
      sort: alphasort
    });
    var pack = Pack(doGH ? pkg : null);
    var writer = Writer(target);
    var entry = doGH ? 0 : 1;
    t.ok(reader, "reader ok");
    t.ok(pack, "pack ok");
    t.ok(writer, "writer ok");
    pack.pipe(writer);
    var parse = tar.Parse();
    t.ok(parse, "parser should be ok");
    pack.on("data", function(c) {
      if (c.length !== 512) {
        t.equal(c.length, 512, "parser should emit data in 512byte blocks");
      }
      parse.write(c);
    });
    pack.on("end", function() {
      t.pass("parser ends");
      parse.end();
    });
    pack.on("error", function(er) {
      t.fail("pack error", er);
    });
    parse.on("error", function(er) {
      t.fail("parse error", er);
    });
    writer.on("error", function(er) {
      t.fail("writer error", er);
    });
    reader.on("error", function(er) {
      t.fail("reader error", er);
    });
    parse.on("*", function(ev, e) {
      var wanted = entries[entry++];
      if (!wanted) {
        t.fail("unexpected event: " + ev);
        return ;
      }
      t.equal(ev, wanted[0], "event type should be " + wanted[0]);
      t.has(e.props, wanted[1], "properties " + wanted[1].path);
      if (wanted[2]) {
        e.on("end", function() {
          if (!e.fields) {
            t.ok(e.fields, "should get fields");
          } else {
            t.has(e.fields, wanted[2], "should get expected fields");
          }
        });
      }
    });
    reader.pipe(pack);
    writer.on("close", function() {
      t.equal(entry, entries.length, "should get all expected entries");
      t.pass("it finished");
      t.end();
    });
  }
})(require("process"));
