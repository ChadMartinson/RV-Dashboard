/* */ 
var compilerbase = require("./base");
exports.attach = function(Handlebars) {
  compilerbase.attach(Handlebars);
  var Compiler = Handlebars.Compiler = function() {};
  var JavaScriptCompiler = Handlebars.JavaScriptCompiler = function() {};
  Compiler.prototype = {
    compiler: Compiler,
    disassemble: function() {
      var opcodes = this.opcodes,
          opcode,
          out = [],
          params,
          param;
      for (var i = 0,
          l = opcodes.length; i < l; i++) {
        opcode = opcodes[i];
        if (opcode.opcode === 'DECLARE') {
          out.push("DECLARE " + opcode.name + "=" + opcode.value);
        } else {
          params = [];
          for (var j = 0; j < opcode.args.length; j++) {
            param = opcode.args[j];
            if (typeof param === "string") {
              param = "\"" + param.replace("\n", "\\n") + "\"";
            }
            params.push(param);
          }
          out.push(opcode.opcode + " " + params.join(" "));
        }
      }
      return out.join("\n");
    },
    equals: function(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }
      for (var i = 0; i < len; i++) {
        var opcode = this.opcodes[i],
            otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
          return false;
        }
        for (var j = 0; j < opcode.args.length; j++) {
          if (opcode.args[j] !== otherOpcode.args[j]) {
            return false;
          }
        }
      }
      len = this.children.length;
      if (other.children.length !== len) {
        return false;
      }
      for (i = 0; i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }
      return true;
    },
    guid: 0,
    compile: function(program, options) {
      this.children = [];
      this.depths = {list: []};
      this.options = options;
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }
      return this.program(program);
    },
    accept: function(node) {
      return this[node.type](node);
    },
    program: function(program) {
      var statements = program.statements,
          statement;
      this.opcodes = [];
      for (var i = 0,
          l = statements.length; i < l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }
      this.isSimple = l === 1;
      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });
      return this;
    },
    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++,
          depth;
      this.usePartial = this.usePartial || result.usePartial;
      this.children[guid] = result;
      for (var i = 0,
          l = result.depths.list.length; i < l; i++) {
        depth = result.depths.list[i];
        if (depth < 2) {
          continue;
        } else {
          this.addDepth(depth - 1);
        }
      }
      return guid;
    },
    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;
      if (program) {
        program = this.compileProgram(program);
      }
      if (inverse) {
        inverse = this.compileProgram(inverse);
      }
      var type = this.classifyMustache(mustache);
      if (type === "helper") {
        this.helperMustache(mustache, program, inverse);
      } else if (type === "simple") {
        this.simpleMustache(mustache);
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('blockValue');
      } else {
        this.ambiguousMustache(mustache, program, inverse);
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('ambiguousBlockValue');
      }
      this.opcode('append');
    },
    hash: function(hash) {
      var pairs = hash.pairs,
          pair,
          val;
      this.opcode('pushHash');
      for (var i = 0,
          l = pairs.length; i < l; i++) {
        pair = pairs[i];
        val = pair[1];
        if (this.options.stringParams) {
          if (val.depth) {
            this.addDepth(val.depth);
          }
          this.opcode('getContext', val.depth || 0);
          this.opcode('pushStringParam', val.stringModeValue, val.type);
        } else {
          this.accept(val);
        }
        this.opcode('assignToHash', pair[0]);
      }
      this.opcode('popHash');
    },
    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;
      if (partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }
      this.opcode('invokePartial', partialName.name);
      this.opcode('append');
    },
    content: function(content) {
      this.opcode('appendContent', content.string);
    },
    mustache: function(mustache) {
      var options = this.options;
      var type = this.classifyMustache(mustache);
      if (type === "simple") {
        this.simpleMustache(mustache);
      } else if (type === "helper") {
        this.helperMustache(mustache);
      } else {
        this.ambiguousMustache(mustache);
      }
      if (mustache.escaped && !options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },
    ambiguousMustache: function(mustache, program, inverse) {
      var id = mustache.id,
          name = id.parts[0],
          isBlock = program != null || inverse != null;
      this.opcode('getContext', id.depth);
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      this.opcode('invokeAmbiguous', name, isBlock);
    },
    simpleMustache: function(mustache) {
      var id = mustache.id;
      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }
      this.opcode('resolvePossibleLambda');
    },
    helperMustache: function(mustache, program, inverse) {
      var params = this.setupFullMustacheParams(mustache, program, inverse),
          name = mustache.id.parts[0];
      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
      } else {
        this.opcode('invokeHelper', params.length, name);
      }
    },
    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);
      var name = id.parts[0];
      if (!name) {
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts[0]);
      }
      for (var i = 1,
          l = id.parts.length; i < l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },
    DATA: function(data) {
      this.options.data = true;
      if (data.id.isScoped || data.id.depth) {
        throw new Handlebars.Exception('Scoped data references are not supported: ' + data.original);
      }
      this.opcode('lookupData');
      var parts = data.id.parts;
      for (var i = 0,
          l = parts.length; i < l; i++) {
        this.opcode('lookup', parts[i]);
      }
    },
    STRING: function(string) {
      this.opcode('pushString', string.string);
    },
    INTEGER: function(integer) {
      this.opcode('pushLiteral', integer.integer);
    },
    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },
    comment: function() {},
    opcode: function(name) {
      this.opcodes.push({
        opcode: name,
        args: [].slice.call(arguments, 1)
      });
    },
    declare: function(name, value) {
      this.opcodes.push({
        opcode: 'DECLARE',
        name: name,
        value: value
      });
    },
    addDepth: function(depth) {
      if (isNaN(depth)) {
        throw new Error("EWOT");
      }
      if (depth === 0) {
        return ;
      }
      if (!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },
    classifyMustache: function(mustache) {
      var isHelper = mustache.isHelper;
      var isEligible = mustache.eligibleHelper;
      var options = this.options;
      if (isEligible && !isHelper) {
        var name = mustache.id.parts[0];
        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }
      if (isHelper) {
        return "helper";
      } else if (isEligible) {
        return "ambiguous";
      } else {
        return "simple";
      }
    },
    pushParams: function(params) {
      var i = params.length,
          param;
      while (i--) {
        param = params[i];
        if (this.options.stringParams) {
          if (param.depth) {
            this.addDepth(param.depth);
          }
          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.stringModeValue, param.type);
        } else {
          this[param.type](param);
        }
      }
    },
    setupMustacheParams: function(mustache) {
      var params = mustache.params;
      this.pushParams(params);
      if (mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('emptyHash');
      }
      return params;
    },
    setupFullMustacheParams: function(mustache, program, inverse) {
      var params = mustache.params;
      this.pushParams(params);
      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);
      if (mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('emptyHash');
      }
      return params;
    }
  };
  var Literal = function(value) {
    this.value = value;
  };
  JavaScriptCompiler.prototype = {
    nameLookup: function(parent, name) {
      if (/^[0-9]+$/.test(name)) {
        return parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return parent + "." + name;
      } else {
        return parent + "['" + name + "']";
      }
    },
    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return {
          appendToBuffer: true,
          content: string,
          toString: function() {
            return "buffer += " + string + ";";
          }
        };
      }
    },
    initializeBuffer: function() {
      return this.quotedString("");
    },
    namespace: "Handlebars",
    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};
      Handlebars.log(Handlebars.logger.DEBUG, this.environment.disassemble() + "\n\n");
      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        environments: [],
        aliases: {}
      };
      this.preamble();
      this.stackSlot = 0;
      this.stackVars = [];
      this.registers = {list: []};
      this.compileStack = [];
      this.inlineStack = [];
      this.compileChildren(environment, options);
      var opcodes = environment.opcodes,
          opcode;
      this.i = 0;
      for (l = opcodes.length; this.i < l; this.i++) {
        opcode = opcodes[this.i];
        if (opcode.opcode === 'DECLARE') {
          this[opcode.name] = opcode.value;
        } else {
          this[opcode.opcode].apply(this, opcode.args);
        }
      }
      return this.createFunctionContext(asObject);
    },
    nextOpcode: function() {
      var opcodes = this.environment.opcodes;
      return opcodes[this.i + 1];
    },
    eat: function() {
      this.i = this.i + 1;
    },
    preamble: function() {
      var out = [];
      if (!this.isChild) {
        var namespace = this.namespace;
        var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
        if (this.environment.usePartial) {
          copies = copies + " partials = this.merge(partials, " + namespace + ".partials);";
        }
        if (this.options.data) {
          copies = copies + " data = data || {};";
        }
        out.push(copies);
      } else {
        out.push('');
      }
      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }
      this.lastContext = 0;
      this.source = out;
    },
    createFunctionContext: function(asObject) {
      var locals = this.stackVars.concat(this.registers.list);
      if (locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }
      if (!this.isChild) {
        for (var alias in this.context.aliases) {
          if (this.context.aliases.hasOwnProperty(alias)) {
            this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
          }
        }
      }
      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }
      if (!this.environment.isSimple) {
        this.source.push("return buffer;");
      }
      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];
      for (var i = 0,
          l = this.environment.depths.list.length; i < l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }
      var source = this.mergeSource();
      if (!this.isChild) {
        var revision = Handlebars.COMPILER_REVISION,
            versions = Handlebars.REVISION_CHANGES[revision];
        source = "this.compilerInfo = [" + revision + ",'" + versions + "'];\n" + source;
      }
      if (asObject) {
        params.push(source);
        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
        Handlebars.log(Handlebars.logger.DEBUG, functionSource + "\n\n");
        return functionSource;
      }
    },
    mergeSource: function() {
      var source = '',
          buffer;
      for (var i = 0,
          len = this.source.length; i < len; i++) {
        var line = this.source[i];
        if (line.appendToBuffer) {
          if (buffer) {
            buffer = buffer + '\n    + ' + line.content;
          } else {
            buffer = line.content;
          }
        } else {
          if (buffer) {
            source += 'buffer += ' + buffer + ';\n  ';
            buffer = undefined;
          }
          source += line + '\n  ';
        }
      }
      return source;
    },
    blockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
      var params = ["depth0"];
      this.setupParams(0, params);
      this.replaceStack(function(current) {
        params.splice(1, 0, current);
        return "blockHelperMissing.call(" + params.join(", ") + ")";
      });
    },
    ambiguousBlockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';
      var params = ["depth0"];
      this.setupParams(0, params);
      var current = this.topStack();
      params.splice(1, 0, current);
      params[params.length - 1] = 'options';
      this.source.push("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },
    appendContent: function(content) {
      this.source.push(this.appendToBuffer(this.quotedString(content)));
    },
    append: function() {
      this.flushInline();
      var local = this.popStack();
      this.source.push("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.source.push("else { " + this.appendToBuffer("''") + " }");
      }
    },
    appendEscaped: function() {
      this.context.aliases.escapeExpression = 'this.escapeExpression';
      this.source.push(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
    },
    getContext: function(depth) {
      if (this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },
    lookupOnContext: function(name) {
      this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
    },
    pushContext: function() {
      this.pushStackLiteral('depth' + this.lastContext);
    },
    resolvePossibleLambda: function() {
      this.context.aliases.functionType = '"function"';
      this.replaceStack(function(current) {
        return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
      });
    },
    lookup: function(name) {
      this.replaceStack(function(current) {
        return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
      });
    },
    lookupData: function(id) {
      this.push('data');
    },
    pushStringParam: function(string, type) {
      this.pushStackLiteral('depth' + this.lastContext);
      this.pushString(type);
      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    },
    emptyHash: function() {
      this.pushStackLiteral('{}');
      if (this.options.stringParams) {
        this.register('hashTypes', '{}');
        this.register('hashContexts', '{}');
      }
    },
    pushHash: function() {
      this.hash = {
        values: [],
        types: [],
        contexts: []
      };
    },
    popHash: function() {
      var hash = this.hash;
      this.hash = undefined;
      if (this.options.stringParams) {
        this.register('hashContexts', '{' + hash.contexts.join(',') + '}');
        this.register('hashTypes', '{' + hash.types.join(',') + '}');
      }
      this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
    },
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },
    push: function(expr) {
      this.inlineStack.push(expr);
      return expr;
    },
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },
    invokeHelper: function(paramSize, name) {
      this.context.aliases.helperMissing = 'helpers.helperMissing';
      var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      this.push(helper.name + ' || ' + nonHelper);
      this.replaceStack(function(name) {
        return name + ' ? ' + name + '.call(' + helper.callParams + ") " + ": helperMissing.call(" + helper.helperMissingParams + ")";
      });
    },
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(helper.name + ".call(" + helper.callParams + ")");
    },
    invokeAmbiguous: function(name, helperCall) {
      this.context.aliases.functionType = '"function"';
      this.pushStackLiteral('{}');
      var helper = this.setupHelper(0, name, helperCall);
      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');
      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      var nextStack = this.nextStack();
      this.source.push('if (' + nextStack + ' = ' + helperName + ') { ' + nextStack + ' = ' + nextStack + '.call(' + helper.callParams + '); }');
      this.source.push('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.apply(depth0) : ' + nextStack + '; }');
    },
    invokePartial: function(name) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];
      if (this.options.data) {
        params.push("data");
      }
      this.context.aliases.self = "this";
      this.push("self.invokePartial(" + params.join(", ") + ")");
    },
    assignToHash: function(key) {
      var value = this.popStack(),
          context,
          type;
      if (this.options.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }
      var hash = this.hash;
      if (context) {
        hash.contexts.push("'" + key + "': " + context);
      }
      if (type) {
        hash.types.push("'" + key + "': " + type);
      }
      hash.values.push("'" + key + "': (" + value + ")");
    },
    compiler: JavaScriptCompiler,
    compileChildren: function(environment, options) {
      var children = environment.children,
          child,
          compiler;
      for (var i = 0,
          l = children.length; i < l; i++) {
        child = children[i];
        compiler = new this.compiler();
        var index = this.matchExistingProgram(child);
        if (index == null) {
          this.context.programs.push('');
          index = this.context.programs.length;
          child.index = index;
          child.name = 'program' + index;
          this.context.programs[index] = compiler.compile(child, options, this.context);
          this.context.environments[index] = child;
        } else {
          child.index = index;
          child.name = 'program' + index;
        }
      }
    },
    matchExistingProgram: function(child) {
      for (var i = 0,
          len = this.context.environments.length; i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return i;
        }
      }
    },
    programExpression: function(guid) {
      this.context.aliases.self = "this";
      if (guid == null) {
        return "self.noop";
      }
      var child = this.environment.children[guid],
          depths = child.depths.list,
          depth;
      var programParams = [child.index, child.name, "data"];
      for (var i = 0,
          l = depths.length; i < l; i++) {
        depth = depths[i];
        if (depth === 1) {
          programParams.push("depth0");
        } else {
          programParams.push("depth" + (depth - 1));
        }
      }
      return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
    },
    register: function(name, val) {
      this.useRegister(name);
      this.source.push(name + " = " + val + ";");
    },
    useRegister: function(name) {
      if (!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },
    pushStackLiteral: function(item) {
      return this.push(new Literal(item));
    },
    pushStack: function(item) {
      this.flushInline();
      var stack = this.incrStack();
      if (item) {
        this.source.push(stack + " = " + item + ";");
      }
      this.compileStack.push(stack);
      return stack;
    },
    replaceStack: function(callback) {
      var prefix = '',
          inline = this.isInline(),
          stack;
      if (inline) {
        var top = this.popStack(true);
        if (top instanceof Literal) {
          stack = top.value;
        } else {
          var name = this.stackSlot ? this.topStackName() : this.incrStack();
          prefix = '(' + this.push(name) + ' = ' + top + '),';
          stack = this.topStack();
        }
      } else {
        stack = this.topStack();
      }
      var item = callback.call(this, stack);
      if (inline) {
        if (this.inlineStack.length || this.compileStack.length) {
          this.popStack();
        }
        this.push('(' + prefix + item + ')');
      } else {
        if (!/^stack/.test(stack)) {
          stack = this.nextStack();
        }
        this.source.push(stack + " = (" + prefix + item + ");");
      }
      return stack;
    },
    nextStack: function() {
      return this.pushStack();
    },
    incrStack: function() {
      this.stackSlot++;
      if (this.stackSlot > this.stackVars.length) {
        this.stackVars.push("stack" + this.stackSlot);
      }
      return this.topStackName();
    },
    topStackName: function() {
      return "stack" + this.stackSlot;
    },
    flushInline: function() {
      var inlineStack = this.inlineStack;
      if (inlineStack.length) {
        this.inlineStack = [];
        for (var i = 0,
            len = inlineStack.length; i < len; i++) {
          var entry = inlineStack[i];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            this.pushStack(entry);
          }
        }
      }
    },
    isInline: function() {
      return this.inlineStack.length;
    },
    popStack: function(wrapped) {
      var inline = this.isInline(),
          item = (inline ? this.inlineStack : this.compileStack).pop();
      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        if (!inline) {
          this.stackSlot--;
        }
        return item;
      }
    },
    topStack: function(wrapped) {
      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
          item = stack[stack.length - 1];
      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        return item;
      }
    },
    quotedString: function(str) {
      return '"' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029') + '"';
    },
    setupHelper: function(paramSize, name, missingParams) {
      var params = [];
      this.setupParams(paramSize, params, missingParams);
      var foundHelper = this.nameLookup('helpers', name, 'helper');
      return {
        params: params,
        name: foundHelper,
        callParams: ["depth0"].concat(params).join(", "),
        helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
      };
    },
    setupParams: function(paramSize, params, useRegister) {
      var options = [],
          contexts = [],
          types = [],
          param,
          inverse,
          program;
      options.push("hash:" + this.popStack());
      inverse = this.popStack();
      program = this.popStack();
      if (program || inverse) {
        if (!program) {
          this.context.aliases.self = "this";
          program = "self.noop";
        }
        if (!inverse) {
          this.context.aliases.self = "this";
          inverse = "self.noop";
        }
        options.push("inverse:" + inverse);
        options.push("fn:" + program);
      }
      for (var i = 0; i < paramSize; i++) {
        param = this.popStack();
        params.push(param);
        if (this.options.stringParams) {
          types.push(this.popStack());
          contexts.push(this.popStack());
        }
      }
      if (this.options.stringParams) {
        options.push("contexts:[" + contexts.join(",") + "]");
        options.push("types:[" + types.join(",") + "]");
        options.push("hashContexts:hashContexts");
        options.push("hashTypes:hashTypes");
      }
      if (this.options.data) {
        options.push("data:data");
      }
      options = "{" + options.join(",") + "}";
      if (useRegister) {
        this.register('options', options);
        params.push('options');
      } else {
        params.push(options);
      }
      return params.join(", ");
    }
  };
  var reservedWords = ("break else new var" + " case finally return void" + " catch for switch while" + " continue function this with" + " default if throw" + " delete in try" + " do instanceof typeof" + " abstract enum int short" + " boolean export interface static" + " byte extends long super" + " char final native synchronized" + " class float package throws" + " const goto private transient" + " debugger implements protected volatile" + " double import public let yield").split(" ");
  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
  for (var i = 0,
      l = reservedWords.length; i < l; i++) {
    compilerWords[reservedWords[i]] = true;
  }
  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    if (!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
      return true;
    }
    return false;
  };
  Handlebars.precompile = function(input, options) {
    if (input == null || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
      throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }
    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }
    var ast = Handlebars.parse(input);
    var environment = new Compiler().compile(ast, options);
    return new JavaScriptCompiler().compile(environment, options);
  };
  Handlebars.compile = function(input, options) {
    if (input == null || (typeof input !== 'string' && input.constructor !== Handlebars.AST.ProgramNode)) {
      throw new Handlebars.Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }
    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }
    var compiled;
    function compile() {
      var ast = Handlebars.parse(input);
      var environment = new Compiler().compile(ast, options);
      var templateSpec = new JavaScriptCompiler().compile(environment, options, undefined, true);
      return Handlebars.template(templateSpec);
    }
    return function(context, options) {
      if (!compiled) {
        compiled = compile();
      }
      return compiled.call(this, context, options);
    };
  };
  return Handlebars;
};
