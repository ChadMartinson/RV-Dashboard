/* */ 
(function(Buffer) {
  'use strict';
  var fs = require("fs");
  var path = require("path");
  var commentRx = /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+;)?base64,(.*)$/mg;
  var mapFileCommentRx = /(?:\/\/[@#][ \t]+sourceMappingURL=(.+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/mg;
  function decodeBase64(base64) {
    return new Buffer(base64, 'base64').toString();
  }
  function stripComment(sm) {
    return sm.split(',').pop();
  }
  function readFromFileMap(sm, dir) {
    var r = mapFileCommentRx.exec(sm);
    mapFileCommentRx.lastIndex = 0;
    var filename = r[1] || r[2];
    var filepath = path.join(dir, filename);
    try {
      return fs.readFileSync(filepath, 'utf8');
    } catch (e) {
      throw new Error('An error occurred while trying to read the map file at ' + filepath + '\n' + e);
    }
  }
  function Converter(sm, opts) {
    opts = opts || {};
    if (opts.isFileComment)
      sm = readFromFileMap(sm, opts.commentFileDir);
    if (opts.hasComment)
      sm = stripComment(sm);
    if (opts.isEncoded)
      sm = decodeBase64(sm);
    if (opts.isJSON || opts.isEncoded)
      sm = JSON.parse(sm);
    this.sourcemap = sm;
  }
  function convertFromLargeSource(content) {
    var lines = content.split('\n');
    var line;
    for (var i = lines.length - 1; i > 0; i--) {
      line = lines[i];
      if (~line.indexOf('sourceMappingURL=data:'))
        return exports.fromComment(line);
    }
  }
  Converter.prototype.toJSON = function(space) {
    return JSON.stringify(this.sourcemap, null, space);
  };
  Converter.prototype.toBase64 = function() {
    var json = this.toJSON();
    return new Buffer(json).toString('base64');
  };
  Converter.prototype.toComment = function(options) {
    var base64 = this.toBase64();
    var data = 'sourceMappingURL=data:application/json;base64,' + base64;
    return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
  };
  Converter.prototype.toObject = function() {
    return JSON.parse(this.toJSON());
  };
  Converter.prototype.addProperty = function(key, value) {
    if (this.sourcemap.hasOwnProperty(key))
      throw new Error('property %s already exists on the sourcemap, use set property instead');
    return this.setProperty(key, value);
  };
  Converter.prototype.setProperty = function(key, value) {
    this.sourcemap[key] = value;
    return this;
  };
  Converter.prototype.getProperty = function(key) {
    return this.sourcemap[key];
  };
  exports.fromObject = function(obj) {
    return new Converter(obj);
  };
  exports.fromJSON = function(json) {
    return new Converter(json, {isJSON: true});
  };
  exports.fromBase64 = function(base64) {
    return new Converter(base64, {isEncoded: true});
  };
  exports.fromComment = function(comment) {
    comment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');
    return new Converter(comment, {
      isEncoded: true,
      hasComment: true
    });
  };
  exports.fromMapFileComment = function(comment, dir) {
    return new Converter(comment, {
      commentFileDir: dir,
      isFileComment: true,
      isJSON: true
    });
  };
  exports.fromSource = function(content, largeSource) {
    if (largeSource)
      return convertFromLargeSource(content);
    var m = content.match(commentRx);
    commentRx.lastIndex = 0;
    return m ? exports.fromComment(m.pop()) : null;
  };
  exports.fromMapFileSource = function(content, dir) {
    var m = content.match(mapFileCommentRx);
    mapFileCommentRx.lastIndex = 0;
    return m ? exports.fromMapFileComment(m.pop(), dir) : null;
  };
  exports.removeComments = function(src) {
    commentRx.lastIndex = 0;
    return src.replace(commentRx, '');
  };
  exports.removeMapFileComments = function(src) {
    mapFileCommentRx.lastIndex = 0;
    return src.replace(mapFileCommentRx, '');
  };
  exports.__defineGetter__('commentRegex', function() {
    commentRx.lastIndex = 0;
    return commentRx;
  });
  exports.__defineGetter__('mapFileCommentRegex', function() {
    mapFileCommentRx.lastIndex = 0;
    return mapFileCommentRx;
  });
})(require("buffer").Buffer);
