/* */ 
(function(process) {
  if (process.platform === 'win32') {
    console.log('TAP Version 13\n' + '1..0\n' + '# Skip unix tests, this is not unix\n');
    return ;
  }
  var tap = require("tap");
  process.env.USER = 'sirUser';
  process.env.HOME = '/home/sirUser';
  process.env.HOSTNAME = 'my-machine';
  process.env.TMPDIR = '/tmpdir';
  process.env.TMP = '/tmp';
  process.env.TEMP = '/temp';
  process.env.PATH = '/opt/local/bin:/usr/local/bin:/usr/bin/:bin';
  process.env.PS1 = '(o_o) $ ';
  process.env.EDITOR = 'edit';
  process.env.VISUAL = 'visualedit';
  process.env.SHELL = 'zsh';
  tap.test('basic unix sanity test', function(t) {
    var osenv = require("../osenv");
    t.equal(osenv.user(), process.env.USER);
    t.equal(osenv.home(), process.env.HOME);
    t.equal(osenv.hostname(), process.env.HOSTNAME);
    t.same(osenv.path(), process.env.PATH.split(':'));
    t.equal(osenv.prompt(), process.env.PS1);
    t.equal(osenv.tmpdir(), process.env.TMPDIR);
    process.env.TMPDIR = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.tmpdir(), process.env.TMP);
    process.env.TMP = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.tmpdir(), process.env.TEMP);
    process.env.TEMP = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.tmpdir(), '/home/sirUser/tmp');
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    osenv.home = function() {
      return null;
    };
    t.equal(osenv.tmpdir(), '/tmp');
    t.equal(osenv.editor(), 'edit');
    process.env.EDITOR = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.editor(), 'visualedit');
    process.env.VISUAL = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.editor(), 'vi');
    t.equal(osenv.shell(), 'zsh');
    process.env.SHELL = '';
    delete require.cache[require.resolve('../osenv.js')];
    var osenv = require("../osenv");
    t.equal(osenv.shell(), 'bash');
    t.end();
  });
})(require("process"));
