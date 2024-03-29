/* */ 
"format cjs";
(function(process) {
  ;
  (function() {
    'use strict';
    var esprima,
        exportFn,
        toString = Object.prototype.toString;
    ;
    if (typeof module === 'object' && typeof module.exports === 'object' && typeof require === 'function') {
      esprima = require("esprima");
      exportFn = function(redeyed) {
        module.exports = redeyed;
      };
      bootstrap(esprima, exportFn);
    } else if (typeof define === 'function' && define.amd) {
      define(["esprima"], function(esprima) {
        return bootstrap(esprima);
      });
    } else if (typeof window === 'object') {
      window.redeyed = bootstrap(window.esprima);
    }
    function bootstrap(esprima, exportFn) {
      function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
      }
      function isString(obj) {
        return toString.call(obj) === '[object String]';
      }
      function isNumber(obj) {
        return toString.call(obj) === '[object Number]';
      }
      function isObject(obj) {
        return toString.call(obj) === '[object Object]';
      }
      function surroundWith(before, after) {
        return function(s) {
          return before + s + after;
        };
      }
      function isNonCircular(key) {
        return key !== '_parent';
      }
      function objectizeString(value) {
        var vals = value.split(':');
        if (0 === vals.length || vals.length > 2)
          throw new Error('illegal string config: ' + value + '\nShould be of format "before:after"');
        if (vals.length === 1 || vals[1].length === 0) {
          return vals.indexOf(':') < 0 ? {_before: vals[0]} : {_after: vals[0]};
        } else {
          return {
            _before: vals[0],
            _after: vals[1]
          };
        }
      }
      function objectize(node) {
        function resolve(value, key) {
          if (!value._parent)
            return undefined;
          if (value._parent._default && value._parent._default[key])
            return value._parent._default[key];
          var root = value._parent._parent;
          if (!root)
            return undefined;
          return root._default ? root._default[key] : undefined;
        }
        function process(key) {
          var value = node[key];
          if (!value)
            return ;
          if (isFunction(value))
            return ;
          if (isString(value)) {
            node[key] = value = objectizeString(value);
          }
          value._parent = node;
          if (isObject(value)) {
            if (!value._before && !value._after)
              return objectize(value);
            value._before = value._before || resolve(value, '_before');
            value._after = value._after || resolve(value, '_after');
            return ;
          }
          throw new Error('nodes need to be either {String}, {Object} or {Function}.' + value + ' is neither.');
        }
        if (node._default)
          process('_default');
        Object.keys(node).filter(function(key) {
          return isNonCircular(key) && node.hasOwnProperty(key) && key !== '_before' && key !== '_after' && key !== '_default';
        }).forEach(process);
      }
      function functionize(node) {
        Object.keys(node).filter(function(key) {
          return isNonCircular(key) && node.hasOwnProperty(key);
        }).forEach(function(key) {
          var value = node[key];
          if (isFunction(value))
            return ;
          if (isObject(value)) {
            if (!value._before && !value._after)
              return functionize(value);
            var before = value._before || '';
            var after = value._after || '';
            node[key] = surroundWith(before, after);
            return node[key];
          }
        });
      }
      function normalize(root) {
        objectize(root);
        functionize(root);
      }
      function mergeTokensAndComments(tokens, comments) {
        var all = {};
        function addToAllByRangeStart(t) {
          all[t.range[0]] = t;
        }
        tokens.forEach(addToAllByRangeStart);
        comments.forEach(addToAllByRangeStart);
        return Object.keys(all).map(function(k) {
          return all[k];
        });
      }
      function redeyed(code, config, opts) {
        opts = opts || {};
        code = code.replace(/^\#\!.*/, '');
        var ast = esprima.parse(code, {
          tokens: true,
          comment: true,
          range: true,
          tolerant: true
        }),
            tokens = ast.tokens,
            comments = ast.comments,
            lastSplitEnd = 0,
            splits = [],
            transformedCode,
            all,
            info;
        ;
        normalize(config);
        function tokenIndex(tokens, tkn, start) {
          var current,
              rangeStart = tkn.range[0];
          for (current = start; current < tokens.length; current++) {
            if (tokens[current].range[0] === rangeStart)
              return current;
          }
          throw new Error('Token %s not found at or after index: %d', tkn, start);
        }
        function process(surround) {
          var result,
              currentIndex,
              nextIndex,
              skip = 0,
              splitEnd;
          ;
          result = surround(code.slice(start, end), info);
          if (isObject(result)) {
            splits.push(result.replacement);
            currentIndex = info.tokenIndex;
            nextIndex = tokenIndex(info.tokens, result.skipPastToken, currentIndex);
            skip = nextIndex - currentIndex;
            splitEnd = skip > 0 ? tokens[nextIndex - 1].range[1] : end;
          } else {
            splits.push(result);
            splitEnd = end;
          }
          return {
            skip: skip,
            splitEnd: splitEnd
          };
        }
        function addSplit(start, end, surround, info) {
          var result,
              nextIndex,
              skip = 0;
          ;
          if (start >= end)
            return ;
          if (surround) {
            result = process(surround);
            skip = result.skip;
            lastSplitEnd = result.splitEnd;
          } else {
            splits.push(code.slice(start, end));
            lastSplitEnd = end;
          }
          return skip;
        }
        all = mergeTokensAndComments(tokens, comments);
        for (var tokenIdx = 0; tokenIdx < all.length; tokenIdx++) {
          var token = all[tokenIdx],
              surroundForType = config[token.type],
              surround,
              start,
              end;
          if (surroundForType) {
            surround = surroundForType && surroundForType.hasOwnProperty(token.value) && surroundForType[token.value] && isFunction(surroundForType[token.value]) ? surroundForType[token.value] : surroundForType._default;
            start = token.range[0];
            end = token.range[1];
            addSplit(lastSplitEnd, start);
            info = {
              tokenIndex: tokenIdx,
              tokens: all,
              ast: ast,
              code: code
            };
            tokenIdx += addSplit(start, end, surround, info);
          }
        }
        if (lastSplitEnd < code.length) {
          addSplit(lastSplitEnd, code.length);
        }
        transformedCode = opts.nojoin ? undefined : splits.join('');
        return {
          ast: ast,
          tokens: tokens,
          comments: comments,
          splits: splits,
          code: transformedCode
        };
      }
      return exportFn ? exportFn(redeyed) : redeyed;
    }
  })();
})(require("process"));
