/* */ 
(function(Buffer) {
  module.exports = FileWriter;
  var fs = require("graceful-fs"),
      mkdir = require("mkdirp"),
      Writer = require("./writer"),
      inherits = require("inherits"),
      EOF = {};
  inherits(FileWriter, Writer);
  function FileWriter(props) {
    var me = this;
    if (!(me instanceof FileWriter))
      throw new Error("FileWriter must be called as constructor.");
    if (props.type !== "File" || !props.File) {
      throw new Error("Non-file type " + props.type);
    }
    me._buffer = [];
    me._bytesWritten = 0;
    Writer.call(this, props);
  }
  FileWriter.prototype._create = function() {
    var me = this;
    if (me._stream)
      return ;
    var so = {};
    if (me.props.flags)
      so.flags = me.props.flags;
    so.mode = Writer.filemode;
    if (me._old && me._old.blksize)
      so.bufferSize = me._old.blksize;
    me._stream = fs.createWriteStream(me._path, so);
    me._stream.on("open", function(fd) {
      me.ready = true;
      me._buffer.forEach(function(c) {
        if (c === EOF)
          me._stream.end();
        else
          me._stream.write(c);
      });
      me.emit("ready");
      me.emit("drain");
    });
    me._stream.on("drain", function() {
      me.emit("drain");
    });
    me._stream.on("close", function() {
      me._finish();
    });
  };
  FileWriter.prototype.write = function(c) {
    var me = this;
    me._bytesWritten += c.length;
    if (!me.ready) {
      if (!Buffer.isBuffer(c) && typeof c !== 'string')
        throw new Error('invalid write data');
      me._buffer.push(c);
      return false;
    }
    var ret = me._stream.write(c);
    if (ret === false && me._stream._queue) {
      return me._stream._queue.length <= 2;
    } else {
      return ret;
    }
  };
  FileWriter.prototype.end = function(c) {
    var me = this;
    if (c)
      me.write(c);
    if (!me.ready) {
      me._buffer.push(EOF);
      return false;
    }
    return me._stream.end();
  };
  FileWriter.prototype._finish = function() {
    var me = this;
    if (typeof me.size === "number" && me._bytesWritten != me.size) {
      me.error("Did not get expected byte count.\n" + "expect: " + me.size + "\n" + "actual: " + me._bytesWritten);
    }
    Writer.prototype._finish.call(me);
  };
})(require("buffer").Buffer);
