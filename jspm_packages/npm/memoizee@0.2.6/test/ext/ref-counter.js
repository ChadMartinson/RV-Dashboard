/* */ 
'use strict';
var memoize = require("../../lib/index"),
    nextTick = require("next-tick");
module.exports = function() {
  return {
    "Regular": function(a) {
      var i = 0,
          fn = function(x, y, z) {
            ++i;
            return x + y + z;
          },
          mfn;
      mfn = memoize(fn, {refCounter: true});
      a(mfn.clearRef(3, 5, 7), null, "Clear before");
      a(mfn(3, 5, 7), 15, "Initial");
      a(mfn(3, 5, 7), 15, "Cache");
      a(mfn.clearRef(3, 5, 7), false, "Clear #1");
      mfn(3, 5, 7);
      a(mfn.clearRef(3, 5, 7), false, "Clear #2");
      mfn(3, 5, 7);
      a(mfn.clearRef(3, 5, 7), false, "Clear #3");
      mfn(3, 5, 7);
      a(i, 1, "Not cleared");
      a(mfn.clearRef(3, 5, 7), false, "Clear #4");
      a(mfn.clearRef(3, 5, 7), true, "Clear final");
      mfn(3, 5, 7);
      a(i, 2, "Restarted");
      mfn(3, 5, 7);
      a(i, 2, "Cached again");
    },
    "Regular: Async": function(a, d) {
      var mfn,
          fn,
          u = {},
          i = 0;
      fn = function(x, y, cb) {
        nextTick(function() {
          ++i;
          cb(null, x + y);
        });
        return u;
      };
      mfn = memoize(fn, {
        async: true,
        refCounter: true
      });
      a(mfn.clearRef(3, 7), null, "Clear ref before");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #1");
      }), u, "Initial");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #2");
      }), u, "Initial #2");
      a(mfn(5, 8, function(err, res) {
        a.deep([err, res], [null, 13], "Result B #1");
      }), u, "Initial #2");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #3");
      }), u, "Initial #2");
      a(mfn(5, 8, function(err, res) {
        a.deep([err, res], [null, 13], "Result B #2");
      }), u, "Initial #3");
      nextTick(function() {
        a(i, 2, "Called #2");
        a(mfn(3, 7, function(err, res) {
          a.deep([err, res], [null, 10], "Again: Result");
        }), u, "Again: Initial");
        a(mfn(5, 8, function(err, res) {
          a.deep([err, res], [null, 13], "Again B: Result");
        }), u, "Again B: Initial");
        nextTick(function() {
          a(i, 2, "Again Called #2");
          a(mfn.clearRef(3, 7), false, "Clear ref #1");
          a(mfn.clearRef(3, 7), false, "Clear ref #2");
          a(mfn.clearRef(3, 7), false, "Clear ref #3");
          a(mfn.clearRef(3, 7), true, "Clear ref Final");
          a(mfn(3, 7, function(err, res) {
            a.deep([err, res], [null, 10], "Again: Result");
          }), u, "Again: Initial");
          a(mfn(5, 8, function(err, res) {
            a.deep([err, res], [null, 13], "Again B: Result");
          }), u, "Again B: Initial");
          nextTick(function() {
            a(i, 3, "Call After clear");
            d();
          });
        });
      });
    },
    "Primitive": function(a) {
      var i = 0,
          fn = function(x, y, z) {
            ++i;
            return x + y + z;
          },
          mfn;
      mfn = memoize(fn, {
        primitive: true,
        refCounter: true
      });
      a(mfn.clearRef(3, 5, 7), null, "Clear before");
      a(mfn(3, 5, 7), 15, "Initial");
      a(mfn(3, 5, 7), 15, "Cache");
      a(mfn.clearRef(3, 5, 7), false, "Clear #1");
      mfn(3, 5, 7);
      a(mfn.clearRef(3, 5, 7), false, "Clear #2");
      mfn(3, 5, 7);
      a(mfn.clearRef(3, 5, 7), false, "Clear #3");
      mfn(3, 5, 7);
      a(i, 1, "Not cleared");
      a(mfn.clearRef(3, 5, 7), false, "Clear #4");
      a(mfn.clearRef(3, 5, 7), true, "Clear final");
      mfn(3, 5, 7);
      a(i, 2, "Restarted");
      mfn(3, 5, 7);
      a(i, 2, "Cached again");
    },
    "Primitive: Async": function(a, d) {
      var mfn,
          fn,
          u = {},
          i = 0;
      fn = function(x, y, cb) {
        nextTick(function() {
          ++i;
          cb(null, x + y);
        });
        return u;
      };
      mfn = memoize(fn, {
        async: true,
        primitive: true,
        refCounter: true
      });
      a(mfn.clearRef(3, 7), null, "Clear ref before");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #1");
      }), u, "Initial");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #2");
      }), u, "Initial #2");
      a(mfn(5, 8, function(err, res) {
        a.deep([err, res], [null, 13], "Result B #1");
      }), u, "Initial #2");
      a(mfn(3, 7, function(err, res) {
        a.deep([err, res], [null, 10], "Result #3");
      }), u, "Initial #2");
      a(mfn(5, 8, function(err, res) {
        a.deep([err, res], [null, 13], "Result B #2");
      }), u, "Initial #3");
      nextTick(function() {
        a(i, 2, "Called #2");
        a(mfn(3, 7, function(err, res) {
          a.deep([err, res], [null, 10], "Again: Result");
        }), u, "Again: Initial");
        a(mfn(5, 8, function(err, res) {
          a.deep([err, res], [null, 13], "Again B: Result");
        }), u, "Again B: Initial");
        nextTick(function() {
          a(i, 2, "Again Called #2");
          a(mfn.clearRef(3, 7), false, "Clear ref #1");
          a(mfn.clearRef(3, 7), false, "Clear ref #2");
          a(mfn.clearRef(3, 7), false, "Clear ref #3");
          a(mfn.clearRef(3, 7), true, "Clear ref Final");
          a(mfn(3, 7, function(err, res) {
            a.deep([err, res], [null, 10], "Again: Result");
          }), u, "Again: Initial");
          a(mfn(5, 8, function(err, res) {
            a.deep([err, res], [null, 13], "Again B: Result");
          }), u, "Again B: Initial");
          nextTick(function() {
            a(i, 3, "Call After clear");
            d();
          });
        });
      });
    }
  };
};
