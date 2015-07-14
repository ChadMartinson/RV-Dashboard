/* */ 
var assert = require("assert"),
    request = require("../index"),
    http = require("http");
;
var s = http.createServer(function(req, res) {
  res.statusCode = 200;
  res.end('');
}).listen(6767, function() {
  request('http://localhost:6767', function(err, resp, body) {
    assert.equal(true, true);
  });
  request('HTTP://localhost:6767', function(err, resp, body) {
    assert.equal(true, true);
  });
  request('HtTp://localhost:6767', function(err, resp, body) {
    assert.equal(true, true);
    s.close();
  });
});
