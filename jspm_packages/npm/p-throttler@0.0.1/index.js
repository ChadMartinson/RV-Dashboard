/* */ 
'use strict';
var Q = require("q");
var arrayRemove = require("./lib/arrayRemove");
function PThrottler(defaultConcurrency, types) {
  this._defaultConcurrency = typeof defaultConcurrency === 'number' ? defaultConcurrency : 10;
  this._queue = {};
  this._slots = types || {};
  this._executing = [];
}
PThrottler.prototype.enqueue = function(func, type) {
  var deferred = Q.defer();
  var types;
  var entry;
  type = type || '';
  types = Array.isArray(type) ? type : [type];
  entry = {
    func: func,
    types: types,
    deferred: deferred
  };
  types.forEach(function(type) {
    var queue = this._queue[type] = this._queue[type] || [];
    queue.push(entry);
  }, this);
  Q.fcall(this._processEntry.bind(this, entry));
  return deferred.promise;
};
PThrottler.prototype.abort = function() {
  var promises;
  Object.keys(this._queue).forEach(function(type) {
    this._queue[type] = [];
  }, this);
  promises = this._executing.map(function(entry) {
    return entry.deferred.promise;
  });
  return Q.allResolved(promises).then(function() {});
};
PThrottler.prototype._processQueue = function(type) {
  var queue = this._queue[type];
  var length = queue ? queue.length : 0;
  var x;
  for (x = 0; x < length; ++x) {
    if (this._processEntry(queue[x])) {
      break;
    }
  }
};
PThrottler.prototype._processEntry = function(entry) {
  var allFree = entry.types.every(this._hasSlot, this);
  var promise;
  if (allFree) {
    entry.types.forEach(function(type) {
      arrayRemove(this._queue[type], entry);
      this._takeSlot(type);
    }, this);
    this._executing.push(entry);
    promise = entry.func();
    if (typeof promise.then === 'undefined') {
      promise = Q.resolve(promise);
    }
    promise.then(this._onResolve.bind(this, entry, true), this._onResolve.bind(this, entry, false));
  }
  return allFree;
};
PThrottler.prototype._onResolve = function(entry, ok, result) {
  if (ok) {
    entry.deferred.resolve(result);
  } else {
    entry.deferred.reject(result);
  }
  arrayRemove(this._executing, entry);
  entry.types.forEach(this._freeSlot, this);
  entry.types.forEach(this._processQueue, this);
};
PThrottler.prototype._hasSlot = function(type) {
  var freeSlots = this._slots[type];
  if (freeSlots == null) {
    freeSlots = this._defaultConcurrency;
  }
  return freeSlots > 0;
};
PThrottler.prototype._takeSlot = function(type) {
  if (this._slots[type] == null) {
    this._slots[type] = this._defaultConcurrency;
  } else if (!this._slots[type]) {
    throw new Error('No free slots');
  }
  --this._slots[type];
};
PThrottler.prototype._freeSlot = function(type) {
  if (this._slots[type] != null) {
    ++this._slots[type];
  }
};
PThrottler.create = function(defaultConcurrency, types) {
  return new PThrottler(defaultConcurrency, types);
};
module.exports = PThrottler;
