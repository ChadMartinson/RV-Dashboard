/* */ 
(function(process) {
  module.exports = Writer;
  var fs = require("graceful-fs"),
      inherits = require("inherits"),
      rimraf = require("rimraf"),
      mkdir = require("mkdirp"),
      path = require("path"),
      umask = process.platform === "win32" ? 0 : process.umask(),
      getType = require("./get-type"),
      Abstract = require("./abstract");
  inherits(Writer, Abstract);
  Writer.dirmode = 0777 & (~umask);
  Writer.filemode = 0666 & (~umask);
  var DirWriter = require("./dir-writer"),
      LinkWriter = require("./link-writer"),
      FileWriter = require("./file-writer"),
      ProxyWriter = require("./proxy-writer");
  function Writer(props, current) {
    var me = this;
    if (typeof props === "string") {
      props = {path: props};
    }
    if (!props.path)
      me.error("Must provide a path", null, true);
    var type = getType(props),
        ClassType = Writer;
    switch (type) {
      case "Directory":
        ClassType = DirWriter;
        break;
      case "File":
        ClassType = FileWriter;
        break;
      case "Link":
      case "SymbolicLink":
        ClassType = LinkWriter;
        break;
      case null:
        ClassType = ProxyWriter;
        break;
    }
    if (!(me instanceof ClassType))
      return new ClassType(props);
    Abstract.call(me);
    me.type = props.type;
    me.props = props;
    me.depth = props.depth || 0;
    me.clobber = false === props.clobber ? props.clobber : true;
    me.parent = props.parent || null;
    me.root = props.root || (props.parent && props.parent.root) || me;
    me._path = me.path = path.resolve(props.path);
    if (process.platform === "win32") {
      me.path = me._path = me.path.replace(/\?/g, "_");
      if (me._path.length >= 260) {
        me._swallowErrors = true;
        me._path = "\\\\?\\" + me.path.replace(/\//g, "\\");
      }
    }
    me.basename = path.basename(props.path);
    me.dirname = path.dirname(props.path);
    me.linkpath = props.linkpath || null;
    props.parent = props.root = null;
    me.size = props.size;
    if (typeof props.mode === "string") {
      props.mode = parseInt(props.mode, 8);
    }
    me.readable = false;
    me.writable = true;
    me._buffer = [];
    me.ready = false;
    me.filter = typeof props.filter === "function" ? props.filter : null;
    me._stat(current);
  }
  Writer.prototype._create = function() {
    var me = this;
    fs[me.props.follow ? "stat" : "lstat"](me._path, function(er, current) {
      if (er) {
        return me.warn("Cannot create " + me._path + "\n" + "Unsupported type: " + me.type, "ENOTSUP");
      }
      me._finish();
    });
  };
  Writer.prototype._stat = function(current) {
    var me = this,
        props = me.props,
        stat = props.follow ? "stat" : "lstat",
        who = me._proxy || me;
    if (current)
      statCb(null, current);
    else
      fs[stat](me._path, statCb);
    function statCb(er, current) {
      if (me.filter && !me.filter.call(who, who, current)) {
        me._aborted = true;
        me.emit("end");
        me.emit("close");
        return ;
      }
      if (er || !current) {
        return create(me);
      }
      me._old = current;
      var currentType = getType(current);
      if (currentType !== me.type) {
        return rimraf(me._path, function(er) {
          if (er)
            return me.error(er);
          me._old = null;
          create(me);
        });
      }
      create(me);
    }
  };
  function create(me) {
    mkdir(path.dirname(me._path), Writer.dirmode, function(er, made) {
      if (er)
        return me.error(er);
      me._madeDir = made;
      return me._create();
    });
  }
  function endChmod(me, want, current, path, cb) {
    var wantMode = want.mode,
        chmod = want.follow || me.type !== "SymbolicLink" ? "chmod" : "lchmod";
    if (!fs[chmod])
      return cb();
    if (typeof wantMode !== "number")
      return cb();
    var curMode = current.mode & 0777;
    wantMode = wantMode & 0777;
    if (wantMode === curMode)
      return cb();
    fs[chmod](path, wantMode, cb);
  }
  function endChown(me, want, current, path, cb) {
    if (process.platform === "win32")
      return cb();
    if (!process.getuid || !process.getuid() === 0)
      return cb();
    if (typeof want.uid !== "number" && typeof want.gid !== "number")
      return cb();
    if (current.uid === want.uid && current.gid === want.gid)
      return cb();
    var chown = (me.props.follow || me.type !== "SymbolicLink") ? "chown" : "lchown";
    if (!fs[chown])
      return cb();
    if (typeof want.uid !== "number")
      want.uid = current.uid;
    if (typeof want.gid !== "number")
      want.gid = current.gid;
    fs[chown](path, want.uid, want.gid, cb);
  }
  function endUtimes(me, want, current, path, cb) {
    if (!fs.utimes || process.platform === "win32")
      return cb();
    var utimes = (want.follow || me.type !== "SymbolicLink") ? "utimes" : "lutimes";
    if (utimes === "lutimes" && !fs[utimes]) {
      utimes = "utimes";
    }
    if (!fs[utimes])
      return cb();
    var curA = current.atime,
        curM = current.mtime,
        meA = want.atime,
        meM = want.mtime;
    if (meA === undefined)
      meA = curA;
    if (meM === undefined)
      meM = curM;
    if (!isDate(meA))
      meA = new Date(meA);
    if (!isDate(meM))
      meA = new Date(meM);
    if (meA.getTime() === curA.getTime() && meM.getTime() === curM.getTime())
      return cb();
    fs[utimes](path, meA, meM, cb);
  }
  Writer.prototype._finish = function() {
    var me = this;
    var todo = 0;
    var errState = null;
    var done = false;
    if (me._old) {
      me._old.atime = new Date(0);
      me._old.mtime = new Date(0);
      setProps(me._old);
    } else {
      var stat = me.props.follow ? "stat" : "lstat";
      fs[stat](me._path, function(er, current) {
        if (er) {
          if (er.code === "ENOENT" && (me.type === "Link" || me.type === "SymbolicLink") && process.platform === "win32") {
            me.ready = true;
            me.emit("ready");
            me.emit("end");
            me.emit("close");
            me.end = me._finish = function() {};
            return ;
          } else
            return me.error(er);
        }
        setProps(me._old = current);
      });
    }
    return ;
    function setProps(current) {
      todo += 3;
      endChmod(me, me.props, current, me._path, next("chmod"));
      endChown(me, me.props, current, me._path, next("chown"));
      endUtimes(me, me.props, current, me._path, next("utimes"));
    }
    function next(what) {
      return function(er) {
        if (errState)
          return ;
        if (er) {
          er.fstream_finish_call = what;
          return me.error(errState = er);
        }
        if (--todo > 0)
          return ;
        if (done)
          return ;
        done = true;
        if (!me._madeDir)
          return end();
        else
          endMadeDir(me, me._path, end);
        function end(er) {
          if (er) {
            er.fstream_finish_call = "setupMadeDir";
            return me.error(er);
          }
          me.emit("end");
          me.emit("close");
        }
      };
    }
  };
  function endMadeDir(me, p, cb) {
    var made = me._madeDir;
    var d = path.dirname(p);
    endMadeDir_(me, d, function(er) {
      if (er)
        return cb(er);
      if (d === made) {
        return cb();
      }
      endMadeDir(me, d, cb);
    });
  }
  function endMadeDir_(me, p, cb) {
    var dirProps = {};
    Object.keys(me.props).forEach(function(k) {
      dirProps[k] = me.props[k];
      if (k === "mode" && me.type !== "Directory") {
        dirProps[k] = dirProps[k] | 0111;
      }
    });
    var todo = 3,
        errState = null;
    fs.stat(p, function(er, current) {
      if (er)
        return cb(errState = er);
      endChmod(me, dirProps, current, p, next);
      endChown(me, dirProps, current, p, next);
      endUtimes(me, dirProps, current, p, next);
    });
    function next(er) {
      if (errState)
        return ;
      if (er)
        return cb(errState = er);
      if (--todo === 0)
        return cb();
    }
  }
  Writer.prototype.pipe = function() {
    this.error("Can't pipe from writable stream");
  };
  Writer.prototype.add = function() {
    this.error("Cannot add to non-Directory type");
  };
  Writer.prototype.write = function() {
    return true;
  };
  function objectToString(d) {
    return Object.prototype.toString.call(d);
  }
  function isDate(d) {
    return typeof d === 'object' && objectToString(d) === '[object Date]';
  }
})(require("process"));
