/* */ 
'use strict';
var forEach = require("es5-ext/lib/Object/for-each"),
    pad = require("es5-ext/lib/String/prototype/pad"),
    memoizee = require("../lib/index"),
    underscore = require("underscore").memoize,
    lodash = require("lodash").memoize,
    lruCache = require("lru-cache"),
    now = Date.now,
    time,
    getFib,
    lru,
    memo,
    total,
    index = 3000,
    count = 10,
    i,
    lruMax = 1000,
    data = {},
    lruObj;
getFib = function(memoize, opts) {
  var fib = memoize(function(x) {
    return (x < 2) ? 1 : fib(x - 1) + fib(x - 2);
  }, opts);
  return fib;
};
lru = function(x) {
  var value = lruObj.get(x);
  if (value === undefined) {
    value = ((x < 2) ? 1 : lru(x - 1) + lru(x - 2));
    lruObj.set(x, value);
  }
  return value;
};
console.log("Fibonacci", index, "x" + count + ":\n");
total = 0;
i = count;
while (i--) {
  memo = getFib(memoizee);
  time = now();
  memo(index);
  total += now() - time;
}
data["Memoizee (object mode)"] = total;
total = 0;
i = count;
while (i--) {
  memo = getFib(memoizee, {primitive: true});
  time = now();
  memo(index);
  total += now() - time;
}
data["Memoizee (primitive mode)"] = total;
total = 0;
i = count;
while (i--) {
  memo = getFib(underscore);
  time = now();
  memo(index);
  total += now() - time;
}
data["Underscore"] = total;
total = 0;
i = count;
while (i--) {
  memo = getFib(lodash);
  time = now();
  memo(index);
  total += now() - time;
}
data["Lo-dash"] = total;
total = 0;
i = count;
while (i--) {
  memo = getFib(memoizee, {
    primitive: true,
    max: lruMax
  });
  time = now();
  memo(index);
  total += now() - time;
}
data["Memoizee (primitive mode) LRU (max: 1000)"] = total;
total = 0;
i = count;
while (i--) {
  memo = getFib(memoizee, {max: lruMax});
  time = now();
  memo(index);
  total += now() - time;
}
data["Memoizee (object mode)    LRU (max: 1000)"] = total;
total = 0;
i = count;
while (i--) {
  lruObj = lruCache({max: lruMax});
  time = now();
  lru(index);
  total += now() - time;
}
data["lru-cache                 LRU (max: 1000)"] = total;
forEach(data, function(value, name, obj, index) {
  console.log(index + 1 + ":", pad.call(value, " ", 5) + "ms ", name);
}, null, function(a, b) {
  return this[a] - this[b];
});
