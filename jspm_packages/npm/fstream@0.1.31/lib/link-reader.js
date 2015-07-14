/* */ 
module.exports = LinkReader;
var fs = require("graceful-fs"),
    fstream = require("../fstream"),
    inherits = require("inherits"),
    mkdir = require("mkdirp"),
    Reader = require("./reader");
inherits(LinkReader, Reader);
function LinkReader(props) {
  var me = this;
  if (!(me instanceof LinkReader))
    throw new Error("LinkReader must be called as constructor.");
  if (!((props.type === "Link" && props.Link) || (props.type === "SymbolicLink" && props.SymbolicLink))) {
    throw new Error("Non-link type " + props.type);
  }
  Reader.call(me, props);
}
LinkReader.prototype._stat = function(currentStat) {
  var me = this;
  fs.readlink(me._path, function(er, linkpath) {
    if (er)
      return me.error(er);
    me.linkpath = me.props.linkpath = linkpath;
    me.emit("linkpath", linkpath);
    Reader.prototype._stat.call(me, currentStat);
  });
};
LinkReader.prototype._read = function() {
  var me = this;
  if (me._paused)
    return ;
  if (!me._ended) {
    me.emit("end");
    me.emit("close");
    me._ended = true;
  }
};
