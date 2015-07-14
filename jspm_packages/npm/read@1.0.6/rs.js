/* */ 
var read = require("./lib/read");
read({
  silent: true,
  prompt: 'stars: '
}, function(er, data) {
  console.log(er, data);
});
