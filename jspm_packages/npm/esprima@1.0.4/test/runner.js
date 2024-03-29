/* */ 
(function(process) {
  var runTests;
  function adjustRegexLiteral(key, value) {
    'use strict';
    if (key === 'value' && value instanceof RegExp) {
      value = value.toString();
    }
    return value;
  }
  function NotMatchingError(expected, actual) {
    'use strict';
    Error.call(this, 'Expected ');
    this.expected = expected;
    this.actual = actual;
  }
  NotMatchingError.prototype = new Error();
  function errorToObject(e) {
    'use strict';
    var msg = e.toString();
    if (msg.substr(0, 6) !== 'Error:') {
      if (typeof e.message === 'string') {
        msg = 'Error: ' + e.message;
      }
    }
    return {
      index: e.index,
      lineNumber: e.lineNumber,
      column: e.column,
      message: msg
    };
  }
  function testParse(esprima, code, syntax) {
    'use strict';
    var expected,
        tree,
        actual,
        options,
        StringObject,
        i,
        len,
        err;
    StringObject = String;
    options = {
      comment: (typeof syntax.comments !== 'undefined'),
      range: true,
      loc: true,
      tokens: (typeof syntax.tokens !== 'undefined'),
      raw: true,
      tolerant: (typeof syntax.errors !== 'undefined')
    };
    if (typeof syntax.tokens !== 'undefined') {
      if (syntax.tokens.length > 0) {
        options.range = (typeof syntax.tokens[0].range !== 'undefined');
        options.loc = (typeof syntax.tokens[0].loc !== 'undefined');
      }
    }
    if (typeof syntax.comments !== 'undefined') {
      if (syntax.comments.length > 0) {
        options.range = (typeof syntax.comments[0].range !== 'undefined');
        options.loc = (typeof syntax.comments[0].loc !== 'undefined');
      }
    }
    expected = JSON.stringify(syntax, null, 4);
    try {
      tree = esprima.parse(code, options);
      tree = (options.comment || options.tokens || options.tolerant) ? tree : tree.body[0];
      if (options.tolerant) {
        for (i = 0, len = tree.errors.length; i < len; i += 1) {
          tree.errors[i] = errorToObject(tree.errors[i]);
        }
      }
      actual = JSON.stringify(tree, adjustRegexLiteral, 4);
      esprima.parse(new StringObject(code), options);
    } catch (e) {
      throw new NotMatchingError(expected, e.toString());
    }
    if (expected !== actual) {
      throw new NotMatchingError(expected, actual);
    }
    function filter(key, value) {
      if (key === 'value' && value instanceof RegExp) {
        value = value.toString();
      }
      return (key === 'loc' || key === 'range') ? undefined : value;
    }
    if (options.tolerant) {
      return ;
    }
    options.range = false;
    options.loc = false;
    expected = JSON.stringify(syntax, filter, 4);
    try {
      tree = esprima.parse(code, options);
      tree = (options.comment || options.tokens) ? tree : tree.body[0];
      if (options.tolerant) {
        for (i = 0, len = tree.errors.length; i < len; i += 1) {
          tree.errors[i] = errorToObject(tree.errors[i]);
        }
      }
      actual = JSON.stringify(tree, filter, 4);
    } catch (e) {
      throw new NotMatchingError(expected, e.toString());
    }
    if (expected !== actual) {
      throw new NotMatchingError(expected, actual);
    }
  }
  function testError(esprima, code, exception) {
    'use strict';
    var i,
        options,
        expected,
        actual,
        handleInvalidRegexFlag;
    options = [{}, {comment: true}, {raw: true}, {
      raw: true,
      comment: true
    }];
    handleInvalidRegexFlag = false;
    try {
      'test'.match(new RegExp('[a-z]', 'x'));
    } catch (e) {
      handleInvalidRegexFlag = true;
    }
    expected = JSON.stringify(exception);
    for (i = 0; i < options.length; i += 1) {
      try {
        esprima.parse(code, options[i]);
      } catch (e) {
        actual = JSON.stringify(errorToObject(e));
      }
      if (expected !== actual) {
        if (exception.message.indexOf('Invalid regular expression') > 0) {
          if (typeof actual === 'undefined' && !handleInvalidRegexFlag) {
            return ;
          }
        }
        throw new NotMatchingError(expected, actual);
      }
    }
  }
  function testAPI(esprima, code, result) {
    'use strict';
    var expected,
        res,
        actual;
    expected = JSON.stringify(result.result, null, 4);
    try {
      if (typeof result.property !== 'undefined') {
        res = esprima[result.property];
      } else {
        res = esprima[result.call].apply(esprima, result.args);
      }
      actual = JSON.stringify(res, adjustRegexLiteral, 4);
    } catch (e) {
      throw new NotMatchingError(expected, e.toString());
    }
    if (expected !== actual) {
      throw new NotMatchingError(expected, actual);
    }
  }
  function runTest(esprima, code, result) {
    'use strict';
    if (result.hasOwnProperty('lineNumber')) {
      testError(esprima, code, result);
    } else if (result.hasOwnProperty('result')) {
      testAPI(esprima, code, result);
    } else {
      testParse(esprima, code, result);
    }
  }
  if (typeof window !== 'undefined') {
    runTests = function() {
      'use strict';
      var total = 0,
          failures = 0,
          category,
          fixture,
          source,
          tick,
          expected,
          index,
          len;
      function setText(el, str) {
        if (typeof el.innerText === 'string') {
          el.innerText = str;
        } else {
          el.textContent = str;
        }
      }
      function startCategory(category) {
        var report,
            e;
        report = document.getElementById('report');
        e = document.createElement('h4');
        setText(e, category);
        report.appendChild(e);
      }
      function reportSuccess(code) {
        var report,
            e;
        report = document.getElementById('report');
        e = document.createElement('pre');
        e.setAttribute('class', 'code');
        setText(e, code);
        report.appendChild(e);
      }
      function reportFailure(code, expected, actual) {
        var report,
            e;
        report = document.getElementById('report');
        e = document.createElement('p');
        setText(e, 'Code:');
        report.appendChild(e);
        e = document.createElement('pre');
        e.setAttribute('class', 'code');
        setText(e, code);
        report.appendChild(e);
        e = document.createElement('p');
        setText(e, 'Expected');
        report.appendChild(e);
        e = document.createElement('pre');
        e.setAttribute('class', 'expected');
        setText(e, expected);
        report.appendChild(e);
        e = document.createElement('p');
        setText(e, 'Actual');
        report.appendChild(e);
        e = document.createElement('pre');
        e.setAttribute('class', 'actual');
        setText(e, actual);
        report.appendChild(e);
      }
      setText(document.getElementById('version'), esprima.version);
      tick = new Date();
      for (category in testFixture) {
        if (testFixture.hasOwnProperty(category)) {
          startCategory(category);
          fixture = testFixture[category];
          for (source in fixture) {
            if (fixture.hasOwnProperty(source)) {
              expected = fixture[source];
              total += 1;
              try {
                runTest(esprima, source, expected);
                reportSuccess(source, JSON.stringify(expected, null, 4));
              } catch (e) {
                failures += 1;
                reportFailure(source, e.expected, e.actual);
              }
            }
          }
        }
      }
      tick = (new Date()) - tick;
      if (failures > 0) {
        setText(document.getElementById('status'), total + ' tests. ' + 'Failures: ' + failures + '. ' + tick + ' ms');
      } else {
        setText(document.getElementById('status'), total + ' tests. ' + 'No failure. ' + tick + ' ms');
      }
    };
  } else {
    (function() {
      'use strict';
      var esprima = require("../esprima"),
          vm = require("vm"),
          fs = require("fs"),
          total = 0,
          failures = [],
          tick = new Date(),
          expected,
          header;
      vm.runInThisContext(fs.readFileSync(__dirname + '/test.js', 'utf-8'));
      Object.keys(testFixture).forEach(function(category) {
        Object.keys(testFixture[category]).forEach(function(source) {
          total += 1;
          expected = testFixture[category][source];
          try {
            runTest(esprima, source, expected);
          } catch (e) {
            e.source = source;
            failures.push(e);
          }
        });
      });
      tick = (new Date()) - tick;
      header = total + ' tests. ' + failures.length + ' failures. ' + tick + ' ms';
      if (failures.length) {
        console.error(header);
        failures.forEach(function(failure) {
          console.error(failure.source + ': Expected\n    ' + failure.expected.split('\n').join('\n    ') + '\nto match\n    ' + failure.actual);
        });
      } else {
        console.log(header);
      }
      process.exit(failures.length === 0 ? 0 : 1);
    }());
  }
})(require("process"));
