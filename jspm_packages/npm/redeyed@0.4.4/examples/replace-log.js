/* */ 
var path = require("path"),
    fs = require("fs"),
    redeyed = require("../redeyed"),
    vm = require("vm");
;
var samplePath = path.join(__dirname, 'sources', 'log.js'),
    origCode = fs.readFileSync(samplePath, 'utf-8'),
    kinds = ['silly', 'info', 'warn', 'error'];
;
function replaceConsole(s, info) {
  var code = info.code,
      idx = info.tokenIndex,
      tokens = info.tokens,
      next = tokens[idx + 1].value,
      kind = tokens[idx + 2].value,
      openParen = tokens[idx + 3].value,
      firstArgTkn = tokens[idx + 4],
      argIdx = idx + 3,
      open,
      tkn;
  ;
  if (kind === 'log')
    kind = 'silly';
  if (next !== '.' || !~kinds.indexOf(kind) || openParen !== '(')
    return s;
  open = 1;
  while (open) {
    tkn = tokens[++argIdx];
    if (tkn.value === '(')
      open++;
    if (tkn.value === ')')
      open--;
  }
  var argsIncludingClosingParen = code.slice(firstArgTkn.range[0], tkn.range[1]),
      result = 'log.' + kind + '("main-logger", ' + argsIncludingClosingParen;
  return {
    replacement: result,
    skipPastToken: tkn
  };
}
function transformAndRun() {
  var config = {Identifier: {console: replaceConsole}},
      code = redeyed(origCode, config).code,
      context = vm.createContext({require: require});
  console.log('Original code:\n', origCode);
  console.log('\nlog calls replaced:\n', code);
  console.log('\nLets run it:');
  vm.runInContext(code, context, 'transformed-log.vm');
}
transformAndRun();
