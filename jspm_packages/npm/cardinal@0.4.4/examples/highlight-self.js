/* */ 
var cardinal = require("../cardinal");
function highlight() {
  cardinal.highlightFile(__filename, {linenos: true}, function(err, res) {
    if (err)
      return console.error(err);
    console.log(res);
  });
}
highlight();
