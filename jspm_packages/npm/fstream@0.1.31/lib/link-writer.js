/* */ 
(function(process) {
  module.exports = LinkWriter;
  var fs = require("graceful-fs"),
      Writer = require("./writer"),
      inherits = require("inherits"),
      path = require("path"),
      rimraf = require("rimraf");
  inherits(LinkWriter, Writer);
  function LinkWriter(props) {
    var me = this;
    if (!(me instanceof LinkWriter))
      throw new Error("LinkWriter must be called as constructor.");
    if (!((props.type === "Link" && props.Link) || (props.type === "SymbolicLink" && props.SymbolicLink))) {
      throw new Error("Non-link type " + props.type);
    }
    if (props.linkpath === "")
      props.linkpath = ".";
    if (!props.linkpath) {
      me.error("Need linkpath property to create " + props.type);
    }
    Writer.call(this, props);
  }
  LinkWriter.prototype._create = function() {
    var me = this,
        hard = me.type === "Link" || process.platform === "win32",
        link = hard ? "link" : "symlink",
        lp = hard ? path.resolve(me.dirname, me.linkpath) : me.linkpath;
    if (hard)
      return clobber(me, lp, link);
    fs.readlink(me._path, function(er, p) {
      if (p && p === lp)
        return finish(me);
      clobber(me, lp, link);
    });
  };
  function clobber(me, lp, link) {
    rimraf(me._path, function(er) {
      if (er)
        return me.error(er);
      create(me, lp, link);
    });
  }
  function create(me, lp, link) {
    fs[link](lp, me._path, function(er) {
      if (er) {
        if ((er.code === "ENOENT" || er.code === "EACCES" || er.code === "EPERM") && process.platform === "win32") {
          me.ready = true;
          me.emit("ready");
          me.emit("end");
          me.emit("close");
          me.end = me._finish = function() {};
        } else
          return me.error(er);
      }
      finish(me);
    });
  }
  function finish(me) {
    me.ready = true;
    me.emit("ready");
    if (me._ended && !me._finished)
      me._finish();
  }
  LinkWriter.prototype.end = function() {
    this._ended = true;
    if (this.ready) {
      this._finished = true;
      this._finish();
    }
  };
})(require("process"));
