/* */ 
var cardinal = require("../cardinal"),
    hideSemicolonsTheme = require("../themes/hide-semicolons");
function highlight() {
  try {
    var highlighted = cardinal.highlightFileSync(__filename, hideSemicolonsTheme);
    console.log(highlighted);
  } catch (err) {
    console.error(err);
  }
}
highlight();
