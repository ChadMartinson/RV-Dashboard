/* */ 
module.exports = ProxyReader;
var Reader = require("./reader"),
    getType = require("./get-type"),
    inherits = require("inherits"),
    fs = require("graceful-fs");
inherits(ProxyReader, Reader);
function ProxyReader(props) {
  var me = this;
  if (!(me instanceof ProxyReader))
    throw new Error("ProxyReader must be called as constructor.");
  me.props = props;
  me._buffer = [];
  me.ready = false;
  Reader.call(me, props);
}
ProxyReader.prototype._stat = function() {
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
    me._addProxy(Reader(props, current));
  });
};
ProxyReader.prototype._addProxy = function(proxy) {
  var me = this;
  if (me._proxyTarget) {
    return me.error("proxy already set");
  }
  me._proxyTarget = proxy;
  proxy._proxy = me;
  ;
  ["error", "data", "end", "close", "linkpath", "entry", "entryEnd", "child", "childEnd", "warn", "stat"].forEach(function(ev) {
    proxy.on(ev, me.emit.bind(me, ev));
  });
  me.emit("proxy", proxy);
  proxy.on("ready", function() {
    me.ready = true;
    me.emit("ready");
  });
  var calls = me._buffer;
  me._buffer.length = 0;
  calls.forEach(function(c) {
    proxy[c[0]].apply(proxy, c[1]);
  });
};
ProxyReader.prototype.pause = function() {
  return this._proxyTarget ? this._proxyTarget.pause() : false;
};
ProxyReader.prototype.resume = function() {
  return this._proxyTarget ? this._proxyTarget.resume() : false;
};
