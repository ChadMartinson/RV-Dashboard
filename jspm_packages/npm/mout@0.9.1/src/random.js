/* */ 
"format cjs";
define(function(require) {
  return {
    'choice': require("./random/choice"),
    'guid': require("./random/guid"),
    'rand': require("./random/rand"),
    'randBit': require("./random/randBit"),
    'randBool': require("./random/randBool"),
    'randHex': require("./random/randHex"),
    'randInt': require("./random/randInt"),
    'randSign': require("./random/randSign"),
    'random': require("./random/random")
  };
});
