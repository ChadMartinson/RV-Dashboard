/* */ 
(function(Buffer, process) {
  var Dgram = require("dgram");
  var Dns = require("dns");
  var Hoek = require("hoek");
  var internals = {};
  exports.time = function(options, callback) {
    if (arguments.length !== 2) {
      callback = arguments[0];
      options = {};
    }
    var settings = Hoek.clone(options);
    settings.host = settings.host || 'pool.ntp.org';
    settings.port = settings.port || 123;
    settings.resolveReference = settings.resolveReference || false;
    var timeoutId = 0;
    var sent = 0;
    var isFinished = false;
    var finish = function(err, result) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
      }
      if (!isFinished) {
        isFinished = true;
        socket.removeAllListeners();
        socket.close();
        return callback(err, result);
      }
    };
    var socket = Dgram.createSocket('udp4');
    socket.once('error', function(err) {
      return finish(err);
    });
    socket.on('message', function(buffer, rinfo) {
      var received = Date.now();
      var message = new internals.NtpMessage(buffer);
      if (!message.isValid) {
        return finish(new Error('Invalid server response'), message);
      }
      if (message.originateTimestamp !== sent) {
        return finish(new Error('Wrong originate timestamp'), message);
      }
      var T1 = message.originateTimestamp;
      var T2 = message.receiveTimestamp;
      var T3 = message.transmitTimestamp;
      var T4 = received;
      message.d = (T4 - T1) - (T3 - T2);
      message.t = ((T2 - T1) + (T3 - T4)) / 2;
      message.receivedLocally = received;
      if (!settings.resolveReference || message.stratum !== 'secondary') {
        return finish(null, message);
      }
      Dns.reverse(message.referenceId, function(err, domains) {
        if (!err) {
          message.referenceHost = domains[0];
        }
        return finish(null, message);
      });
    });
    if (settings.timeout) {
      timeoutId = setTimeout(function() {
        timeoutId = 0;
        return finish(new Error('Timeout'));
      }, settings.timeout);
    }
    var message = new Buffer(48);
    for (var i = 0; i < 48; i++) {
      message[i] = 0;
    }
    message[0] = (0 << 6) + (4 << 3) + (3 << 0);
    sent = Date.now();
    internals.fromMsecs(sent, message, 40);
    socket.send(message, 0, message.length, settings.port, settings.host, function(err, bytes) {
      if (err || bytes !== 48) {
        return finish(err || new Error('Could not send entire message'));
      }
    });
  };
  internals.NtpMessage = function(buffer) {
    this.isValid = false;
    if (buffer.length !== 48) {
      return ;
    }
    var li = (buffer[0] >> 6);
    switch (li) {
      case 0:
        this.leapIndicator = 'no-warning';
        break;
      case 1:
        this.leapIndicator = 'last-minute-61';
        break;
      case 2:
        this.leapIndicator = 'last-minute-59';
        break;
      case 3:
        this.leapIndicator = 'alarm';
        break;
    }
    var vn = ((buffer[0] & 0x38) >> 3);
    this.version = vn;
    var mode = (buffer[0] & 0x7);
    switch (mode) {
      case 1:
        this.mode = 'symmetric-active';
        break;
      case 2:
        this.mode = 'symmetric-passive';
        break;
      case 3:
        this.mode = 'client';
        break;
      case 4:
        this.mode = 'server';
        break;
      case 5:
        this.mode = 'broadcast';
        break;
      case 0:
      case 6:
      case 7:
        this.mode = 'reserved';
        break;
    }
    var stratum = buffer[1];
    if (stratum === 0) {
      this.stratum = 'death';
    } else if (stratum === 1) {
      this.stratum = 'primary';
    } else if (stratum <= 15) {
      this.stratum = 'secondary';
    } else {
      this.stratum = 'reserved';
    }
    this.pollInterval = Math.round(Math.pow(2, buffer[2])) * 1000;
    this.precision = Math.pow(2, buffer[3]) * 1000;
    var rootDelay = 256 * (256 * (256 * buffer[4] + buffer[5]) + buffer[6]) + buffer[7];
    this.rootDelay = 1000 * (rootDelay / 0x10000);
    this.rootDispersion = ((buffer[8] << 8) + buffer[9] + ((buffer[10] << 8) + buffer[11]) / Math.pow(2, 16)) * 1000;
    this.referenceId = '';
    switch (this.stratum) {
      case 'death':
      case 'primary':
        this.referenceId = String.fromCharCode(buffer[12]) + String.fromCharCode(buffer[13]) + String.fromCharCode(buffer[14]) + String.fromCharCode(buffer[15]);
        break;
      case 'secondary':
        this.referenceId = '' + buffer[12] + '.' + buffer[13] + '.' + buffer[14] + '.' + buffer[15];
        break;
    }
    this.referenceTimestamp = internals.toMsecs(buffer, 16);
    this.originateTimestamp = internals.toMsecs(buffer, 24);
    this.receiveTimestamp = internals.toMsecs(buffer, 32);
    this.transmitTimestamp = internals.toMsecs(buffer, 40);
    if (this.version === 4 && this.stratum !== 'reserved' && this.mode === 'server' && this.originateTimestamp && this.receiveTimestamp && this.transmitTimestamp) {
      this.isValid = true;
    }
    return this;
  };
  internals.toMsecs = function(buffer, offset) {
    var seconds = 0;
    var fraction = 0;
    for (var i = 0; i < 4; ++i) {
      seconds = (seconds * 256) + buffer[offset + i];
    }
    for (i = 4; i < 8; ++i) {
      fraction = (fraction * 256) + buffer[offset + i];
    }
    return ((seconds - 2208988800 + (fraction / Math.pow(2, 32))) * 1000);
  };
  internals.fromMsecs = function(ts, buffer, offset) {
    var seconds = Math.floor(ts / 1000) + 2208988800;
    var fraction = Math.round((ts % 1000) / 1000 * Math.pow(2, 32));
    buffer[offset + 0] = (seconds & 0xFF000000) >> 24;
    buffer[offset + 1] = (seconds & 0x00FF0000) >> 16;
    buffer[offset + 2] = (seconds & 0x0000FF00) >> 8;
    buffer[offset + 3] = (seconds & 0x000000FF);
    buffer[offset + 4] = (fraction & 0xFF000000) >> 24;
    buffer[offset + 5] = (fraction & 0x00FF0000) >> 16;
    buffer[offset + 6] = (fraction & 0x0000FF00) >> 8;
    buffer[offset + 7] = (fraction & 0x000000FF);
  };
  internals.last = {
    offset: 0,
    expires: 0,
    host: '',
    port: 0
  };
  exports.offset = function(options, callback) {
    if (arguments.length !== 2) {
      callback = arguments[0];
      options = {};
    }
    var now = Date.now();
    var clockSyncRefresh = options.clockSyncRefresh || 24 * 60 * 60 * 1000;
    if (internals.last.offset && internals.last.host === options.host && internals.last.port === options.port && now < internals.last.expires) {
      process.nextTick(function() {
        callback(null, internals.last.offset);
      });
      return ;
    }
    exports.time(options, function(err, time) {
      if (err) {
        return callback(err, 0);
      }
      internals.last = {
        offset: Math.round(time.t),
        expires: now + clockSyncRefresh,
        host: options.host,
        port: options.port
      };
      return callback(null, internals.last.offset);
    });
  };
  internals.now = {intervalId: 0};
  exports.start = function(options, callback) {
    if (arguments.length !== 2) {
      callback = arguments[0];
      options = {};
    }
    if (internals.now.intervalId) {
      process.nextTick(function() {
        callback();
      });
      return ;
    }
    exports.offset(options, function(err, offset) {
      internals.now.intervalId = setInterval(function() {
        exports.offset(options, function() {});
      }, options.clockSyncRefresh || 24 * 60 * 60 * 1000);
      return callback();
    });
  };
  exports.stop = function() {
    if (!internals.now.intervalId) {
      return ;
    }
    clearInterval(internals.now.intervalId);
    internals.now.intervalId = 0;
  };
  exports.isLive = function() {
    return !!internals.now.intervalId;
  };
  exports.now = function() {
    var now = Date.now();
    if (!exports.isLive() || now >= internals.last.expires) {
      return now;
    }
    return now + internals.last.offset;
  };
})(require("buffer").Buffer, require("process"));
