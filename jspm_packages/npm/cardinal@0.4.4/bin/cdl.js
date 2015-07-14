/* */ 
(function(process) {
  var cardinal = require("../cardinal"),
      utl = require("../utl"),
      settings = require("../settings"),
      args = process.argv,
      theme = settings.resolveTheme(),
      opts = settings.getSettings(),
      highlighted;
  ;
  opts = opts || {};
  opts.theme = theme;
  function usage() {
    var msg = ['Usage: cdl <filename.js> [options]', '', 'Options (~/.cardinalrc overrides):', '  --nonum: turn off line printing', '', 'Unix Pipe Example: cat filename.js | grep console | cdl', ''].join('\n');
    console.log(msg);
  }
  function highlightFile() {
    try {
      highlighted = cardinal.highlightFileSync(args[2], opts);
      console.log(highlighted);
    } catch (e) {
      console.trace();
      console.error(e);
    }
  }
  if (args.length === 3)
    return highlightFile();
  var opt = args[3];
  if (opt && opt.indexOf('--') === 0) {
    if ((/^--(nonum|noline)/i).test(opt))
      opts.linenos = false;
    else {
      usage();
      return console.error('Unknown option: ', opt);
    }
    return highlightFile();
  }
  var stdin = process.stdin,
      stdout = process.stdout;
  opts.linenos = false;
  stdin.setEncoding('utf-8');
  stdin.resume();
  stdin.on('data', function(chunk) {
    chunk.split('\n').forEach(function(line) {
      try {
        stdout.write(cardinal.highlight(line, opts) + '\n');
      } catch (e) {
        stdout.write(line + '\n');
      }
    });
  });
})(require("process"));
