/* */ 
module.exports = DirWriter;
var fs = require("graceful-fs"),
    fstream = require("../fstream"),
    Writer = require("./writer"),
    inherits = require("inherits"),
    mkdir = require("mkdirp"),
    path = require("path"),
    collect = require("./collect");
inherits(DirWriter, Writer);
function DirWriter(props) {
  var me = this;
  if (!(me instanceof DirWriter))
    me.error("DirWriter must be called as constructor.", null, true);
  if (props.type !== "Directory" || !props.Directory) {
    me.error("Non-directory type " + props.type + " " + JSON.stringify(props), null, true);
  }
  Writer.call(this, props);
}
DirWriter.prototype._create = function() {
  var me = this;
  mkdir(me._path, Writer.dirmode, function(er) {
    if (er)
      return me.error(er);
    me.ready = true;
    me.emit("ready");
    me._process();
  });
};
DirWriter.prototype.write = function() {
  return true;
};
DirWriter.prototype.end = function() {
  this._ended = true;
  this._process();
};
DirWriter.prototype.add = function(entry) {
  var me = this;
  collect(entry);
  if (!me.ready || me._currentEntry) {
    me._buffer.push(entry);
    return false;
  }
  if (me._ended) {
    return me.error("add after end");
  }
  me._buffer.push(entry);
  me._process();
  return 0 === this._buffer.length;
};
DirWriter.prototype._process = function() {
  var me = this;
  if (me._processing)
    return ;
  var entry = me._buffer.shift();
  if (!entry) {
    me.emit("drain");
    if (me._ended)
      me._finish();
    return ;
  }
  me._processing = true;
  me.emit("entry", entry);
  var p = entry;
  do {
    var pp = p._path || p.path;
    if (pp === me.root._path || pp === me._path || (pp && pp.indexOf(me._path) === 0)) {
      me._processing = false;
      if (entry._collected)
        entry.pipe();
      return me._process();
    }
  } while (p = p.parent);
  var props = {
    parent: me,
    root: me.root || me,
    type: entry.type,
    depth: me.depth + 1
  };
  var p = entry._path || entry.path || entry.props.path;
  if (entry.parent) {
    p = p.substr(entry.parent._path.length + 1);
  }
  props.path = path.join(me.path, path.join("/", p));
  props.filter = me.filter;
  Object.keys(entry.props).forEach(function(k) {
    if (!props.hasOwnProperty(k)) {
      props[k] = entry.props[k];
    }
  });
  var child = me._currentChild = new Writer(props);
  child.on("ready", function() {
    entry.pipe(child);
    entry.resume();
  });
  child.on("error", function(er) {
    if (child._swallowErrors) {
      me.warn(er);
      child.emit("end");
      child.emit("close");
    } else {
      me.emit("error", er);
    }
  });
  child.on("close", onend);
  var ended = false;
  function onend() {
    if (ended)
      return ;
    ended = true;
    me._currentChild = null;
    me._processing = false;
    me._process();
  }
};
