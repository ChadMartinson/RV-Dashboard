/* */ 
module.exports = SocketReader;
var fs = require("graceful-fs"),
    fstream = require("../fstream"),
    inherits = require("inherits"),
    mkdir = require("mkdirp"),
    Reader = require("./reader");
inherits(SocketReader, Reader);
function SocketReader(props) {
  var me = this;
  if (!(me instanceof SocketReader))
    throw new Error("SocketReader must be called as constructor.");
  if (!(props.type === "Socket" && props.Socket)) {
    throw new Error("Non-socket type " + props.type);
  }
  Reader.call(me, props);
}
SocketReader.prototype._read = function() {
  var me = this;
  if (me._paused)
    return ;
  if (!me._ended) {
    me.emit("end");
    me.emit("close");
    me._ended = true;
  }
};
