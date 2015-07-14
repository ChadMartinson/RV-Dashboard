/* */ 
var tar = require("../tar"),
    fstream = require("fstream"),
    fs = require("fs");
var dir_destination = fs.createWriteStream('dir.tar');
fstream.Reader({
  path: __dirname,
  type: "Directory"
}).pipe(tar.Pack({noProprietary: true})).pipe(dir_destination);
