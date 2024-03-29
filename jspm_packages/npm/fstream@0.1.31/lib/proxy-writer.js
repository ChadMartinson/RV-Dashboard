/* */ 
module.exports = ProxyWriter;
var Writer = require("./writer"),
    getType = require("./get-type"),
    inherits = require("inherits"),
    collect = require("./collect"),
    fs = require("fs");
inherits(ProxyWriter, Writer);
function ProxyWriter(props) {
  var me = this;
  if (!(me instanceof ProxyWriter))
    throw new Error("ProxyWriter must be called as constructor.");
  me.props = props;
  me._needDrain = false;
  Writer.call(me, props);
}
ProxyWriter.prototype._stat = function() {
  var me = this,
      props = me.props,
      stat = props.follow ? "stat" : "lstat";
  fs[stat](props.path, function(er, current) {
    var type;
    if (er || !current) {
      type = "File";
    } else {
      type = getType(current);
    }
    props[type] = true;
    props.type = me.type = type;
    me._old = current;
    me._addProxy(Writer(props, current));
  });
};
ProxyWriter.prototype._addProxy = function(proxy) {
  var me = this;
  if (me._proxy) {
    return me.error("proxy already set");
  }
  me._proxy = proxy;
  ;
  ["ready", "error", "close", "pipe", "drain", "warn"].forEach(function(ev) {
    proxy.on(ev, me.emit.bind(me, ev));
  });
  me.emit("proxy", proxy);
  var calls = me._buffer;
  calls.forEach(function(c) {
    proxy[c[0]].apply(proxy, c[1]);
  });
  me._buffer.length = 0;
  if (me._needsDrain)
    me.emit("drain");
};
ProxyWriter.prototype.add = function(entry) {
  collect(entry);
  if (!this._proxy) {
    this._buffer.push(["add", [entry]]);
    this._needDrain = true;
    return false;
  }
  return this._proxy.add(entry);
};
ProxyWriter.prototype.write = function(c) {
  if (!this._proxy) {
    this._buffer.push(["write", [c]]);
    this._needDrain = true;
    return false;
  }
  return this._proxy.write(c);
};
ProxyWriter.prototype.end = function(c) {
  if (!this._proxy) {
    this._buffer.push(["end", [c]]);
    return false;
  }
  return this._proxy.end(c);
};
