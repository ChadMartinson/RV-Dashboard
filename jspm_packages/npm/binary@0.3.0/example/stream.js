/* */ 
(function(process) {
  var binary = require("../index");
  var ws = binary().word32lu('x').word16bs('y').word16bu('z').tap(function(vars) {
    console.dir(vars);
  });
  ;
  process.stdin.pipe(ws);
  process.stdin.resume();
})(require("process"));
