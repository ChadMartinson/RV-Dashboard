/* */ 
(function(Buffer) {
  module.exports = FileReader;
  var fs = require("graceful-fs"),
      fstream = require("../fstream"),
      Reader = fstream.Reader,
      inherits = require("inherits"),
      mkdir = require("mkdirp"),
      Reader = require("./reader"),
      EOF = {EOF: true},
      CLOSE = {CLOSE: true};
  inherits(FileReader, Reader);
  function FileReader(props) {
    var me = this;
    if (!(me instanceof FileReader))
      throw new Error("FileReader must be called as constructor.");
    if (!((props.type === "Link" && props.Link) || (props.type === "File" && props.File))) {
      throw new Error("Non-file type " + props.type);
    }
    me._buffer = [];
    me._bytesEmitted = 0;
    Reader.call(me, props);
  }
  FileReader.prototype._getStream = function() {
    var me = this,
        stream = me._stream = fs.createReadStream(me._path, me.props);
    if (me.props.blksize) {
      stream.bufferSize = me.props.blksize;
    }
    stream.on("open", me.emit.bind(me, "open"));
    stream.on("data", function(c) {
      me._bytesEmitted += c.length;
      if (!c.length)
        return ;
      else if (me._paused || me._buffer.length) {
        me._buffer.push(c);
        me._read();
      } else
        me.emit("data", c);
    });
    stream.on("end", function() {
      if (me._paused || me._buffer.length) {
        me._buffer.push(EOF);
        me._read();
      } else {
        me.emit("end");
      }
      if (me._bytesEmitted !== me.props.size) {
        me.error("Didn't get expected byte count\n" + "expect: " + me.props.size + "\n" + "actual: " + me._bytesEmitted);
      }
    });
    stream.on("close", function() {
      if (me._paused || me._buffer.length) {
        me._buffer.push(CLOSE);
        me._read();
      } else {
        me.emit("close");
      }
    });
    me._read();
  };
  FileReader.prototype._read = function() {
    var me = this;
    if (me._paused) {
      return ;
    }
    if (!me._stream) {
      return me._getStream();
    }
    if (me._buffer.length) {
      var buf = me._buffer;
      for (var i = 0,
          l = buf.length; i < l; i++) {
        var c = buf[i];
        if (c === EOF) {
          me.emit("end");
        } else if (c === CLOSE) {
          me.emit("close");
        } else {
          me.emit("data", c);
        }
        if (me._paused) {
          me._buffer = buf.slice(i);
          return ;
        }
      }
      me._buffer.length = 0;
    }
  };
  FileReader.prototype.pause = function(who) {
    var me = this;
    if (me._paused)
      return ;
    who = who || me;
    me._paused = true;
    if (me._stream)
      me._stream.pause();
    me.emit("pause", who);
  };
  FileReader.prototype.resume = function(who) {
    var me = this;
    if (!me._paused)
      return ;
    who = who || me;
    me.emit("resume", who);
    me._paused = false;
    if (me._stream)
      me._stream.resume();
    me._read();
  };
})(require("buffer").Buffer);
