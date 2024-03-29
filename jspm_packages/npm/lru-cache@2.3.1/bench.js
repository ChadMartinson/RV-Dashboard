/* */ 
(function(process) {
  var LRU = require("./lib/lru-cache");
  var max = +process.argv[2] || 10240;
  var more = 102400;
  var cache = LRU({
    max: max,
    maxAge: 86400e3
  });
  for (var i = 0; i < max; ++i) {
    cache.set(i, {});
  }
  var start = process.hrtime();
  for (; i < max + more; ++i) {
    cache.set(i, {});
  }
  var end = process.hrtime(start);
  var msecs = end[0] * 1E3 + end[1] / 1E6;
  console.log('adding %d items took %d ms', more, msecs.toPrecision(5));
})(require("process"));
