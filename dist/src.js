!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FacetedSearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":6}],2:[function(_dereq_,module,exports){

},{}],3:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"FWaASH":4,"inherits":3}],7:[function(_dereq_,module,exports){
(function() {
  module.exports = {
    el: function(el) {
      return {
        closest: function(selector) {
          var getMatcher, isMatch, matcher;
          getMatcher = function(el) {
            return el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
          };
          while (el) {
            matcher = getMatcher(el);
            if (matcher != null) {
              isMatch = matcher.bind(el)(selector);
              if (isMatch) {
                return el;
              }
            }
            el = el.parentNode;
          }
        },

        /*
        		Native alternative to jQuery's $.offset()
        
        		http://www.quirksmode.org/js/findpos.html
         */
        position: function(parent) {
          var left, loopEl, top;
          if (parent == null) {
            parent = document.body;
          }
          left = 0;
          top = 0;
          loopEl = el;
          while ((loopEl != null) && loopEl !== parent) {
            if (this.hasDescendant(parent)) {
              break;
            }
            left += loopEl.offsetLeft;
            top += loopEl.offsetTop;
            loopEl = loopEl.offsetParent;
          }
          return {
            left: left,
            top: top
          };
        },
        boundingBox: function() {
          var box;
          box = this.position();
          box.width = el.clientWidth;
          box.height = el.clientHeight;
          box.right = box.left + box.width;
          box.bottom = box.top + box.height;
          return box;
        },

        /*
        		Is child el a descendant of parent el?
        
        		http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
         */
        hasDescendant: function(child) {
          var node;
          node = child.parentNode;
          while (node != null) {
            if (node === el) {
              return true;
            }
            node = node.parentNode;
          }
          return false;
        },
        insertAfter: function(referenceElement) {
          return referenceElement.parentNode.insertBefore(el, referenceElement.nextSibling);
        },
        hasScrollBar: function(el) {
          return hasScrollBarX(el) || hasScrollBarY(el);
        },
        hasScrollBarX: function(el) {
          return el.scrollWidth > el.clientWidth;
        },
        hasScrollBarY: function(el) {
          return el.scrollHeight > el.clientHeight;
        },
        inViewport: function(parent) {
          var doc, rect, win;
          win = parent != null ? parent : window;
          doc = parent != null ? parent : document.documentElement;
          rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (win.innerHeight || doc.clientHeight) && rect.right <= (win.innerWidth || doc.clientWidth);
        }
      };
    }
  };

}).call(this);

},{}],8:[function(_dereq_,module,exports){
(function() {
  var __hasProp = {}.hasOwnProperty;

  module.exports = {
    get: function(url, options) {
      if (options == null) {
        options = {};
      }
      return this._sendRequest('GET', url, options);
    },
    post: function(url, options) {
      if (options == null) {
        options = {};
      }
      return this._sendRequest('POST', url, options);
    },
    put: function(url, options) {
      if (options == null) {
        options = {};
      }
      return this._sendRequest('PUT', url, options);
    },
    _promise: function() {
      return {
        done: function(fn) {
          return this.callDone = fn;
        },
        callDone: null,
        fail: function(fn) {
          return this.callFail = fn;
        },
        callFail: null,
        always: function(fn) {
          return this.callAlways = fn;
        },
        callAlways: null
      };
    },
    _sendRequest: function(method, url, options) {
      var header, promise, value, xhr, _ref;
      if (options == null) {
        options = {};
      }
      promise = this._promise();
      if (options.headers == null) {
        options.headers = {};
      }
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        var _ref;
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (promise.callAlways != null) {
            promise.callAlways(xhr);
          }
          if ((200 <= (_ref = xhr.status) && _ref <= 206)) {
            if (promise.callDone != null) {
              return promise.callDone(xhr);
            }
          } else {
            if (promise.callFail != null) {
              return promise.callFail(xhr);
            }
          }
        }
      };
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-type", "application/json");
      _ref = options.headers;
      for (header in _ref) {
        if (!__hasProp.call(_ref, header)) continue;
        value = _ref[header];
        xhr.setRequestHeader(header, value);
      }
      xhr.send(options.data);
      return promise;
    }
  };

}).call(this);

},{}],9:[function(_dereq_,module,exports){
(function(){module.exports={generateID:function(t){var n,r;for(t=null!=t&&t>0?t-1:7,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=n.charAt(Math.floor(52*Math.random()));t--;)r+=n.charAt(Math.floor(Math.random()*n.length));return r},setResetTimeout:function(){var t;return t=null,function(n,r,e){return null!=t&&(null!=e&&e(),clearTimeout(t)),t=setTimeout(function(){return t=null,r()},n)}}()}}).call(this);
},{}],10:[function(_dereq_,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.Pagination=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function(){module.exports={generateID:function(t){var n,r;for(t=null!=t&&t>0?t-1:7,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=n.charAt(Math.floor(52*Math.random()));t--;)r+=n.charAt(Math.floor(Math.random()*n.length));return r},setResetTimeout:function(){var t;return t=null,function(n,r,e){return null!=t&&(null!=e&&e(),clearTimeout(t)),t=setTimeout(function(){return t=null,r()},n)}}()}}).call(this);
},{}],2:[function(_dereq_,module,exports){
(function (global){
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};

/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])
(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
var $, Backbone, Pagination, tpl, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

util = _dereq_('funcky.util');

tpl = _dereq_('./main.jade');


/*
Create a pagination view.
@class
@extends Backbone.View
 */

Pagination = (function(_super) {
  __extends(Pagination, _super);

  function Pagination() {
    return Pagination.__super__.constructor.apply(this, arguments);
  }

  Pagination.prototype.tagName = 'ul';

  Pagination.prototype.className = 'hibb-pagination';


  /*
  	@constructs
  	@param {object} this.options
  	@prop {number} options.resultsTotal - Total number of results.
  	@prop {number} options.resultsPerPage - Number of results per page.
  	@prop {number} [options.resultsStart=0] - The result item to start at. Not the start page!
  	@prop {boolean} [options.step10=true] - Render (<< and >>) for steps of 10.
  	@prop {boolean} [options.triggerPageNumber=true] - Trigger the new pageNumber (true) or prev/next (false).
   */

  Pagination.prototype.initialize = function(options) {
    var _base, _base1;
    this.options = options;
    if ((_base = this.options).step10 == null) {
      _base.step10 = true;
    }
    if ((_base1 = this.options).triggerPageNumber == null) {
      _base1.triggerPageNumber = true;
    }
    this._currentPageNumber = (this.options.resultsStart != null) && this.options.resultsStart > 0 ? (this.options.resultsStart / this.options.resultsPerPage) + 1 : 1;
    return this.setPageNumber(this._currentPageNumber, true);
  };

  Pagination.prototype.render = function() {
    var attrs;
    this._pageCount = Math.ceil(this.options.resultsTotal / this.options.resultsPerPage);
    attrs = $.extend(this.options, {
      currentPageNumber: this._currentPageNumber,
      pageCount: this._pageCount
    });
    this.el.innerHTML = tpl(attrs);
    if (this._pageCount <= 1) {
      this.$el.hide();
    }
    return this;
  };

  Pagination.prototype.events = function() {
    return {
      'click li.prev10.active': '_handlePrev10',
      'click li.prev.active': '_handlePrev',
      'click li.next.active': '_handleNext',
      'click li.next10.active': '_handleNext10',
      'click li.current:not(.active)': '_handleCurrentClick',
      'blur li.current.active input': '_handleBlur',
      'keyup li.current.active input': '_handleKeyup'
    };
  };

  Pagination.prototype._handlePrev10 = function() {
    return this.setPageNumber(this._currentPageNumber - 10);
  };

  Pagination.prototype._handlePrev = function() {
    return this.setPageNumber(this._currentPageNumber - 1);
  };

  Pagination.prototype._handleNext = function() {
    return this.setPageNumber(this._currentPageNumber + 1);
  };

  Pagination.prototype._handleNext10 = function() {
    return this.setPageNumber(this._currentPageNumber + 10);
  };

  Pagination.prototype._handleCurrentClick = function(ev) {
    var input, span, target;
    target = this.$(ev.currentTarget);
    span = target.find('span');
    input = target.find('input');
    input.width(span.width());
    target.addClass('active');
    input.animate({
      width: 40
    }, 'fast');
    input.focus();
    return input.val(this._currentPageNumber);
  };

  Pagination.prototype._handleKeyup = function(ev) {
    var input, newPageNumber;
    input = this.$(ev.currentTarget);
    newPageNumber = +input.val();
    if (ev.keyCode === 13) {
      if ((1 <= newPageNumber && newPageNumber <= this._pageCount)) {
        this.setPageNumber(newPageNumber);
      }
      return this._deactivateCurrentLi(input);
    }
  };

  Pagination.prototype._handleBlur = function(ev) {
    return this._deactivateCurrentLi(this.$(ev.currentTarget));
  };

  Pagination.prototype._deactivateCurrentLi = function(input) {
    return input.animate({
      width: 0
    }, 'fast', function() {
      var li;
      li = input.parent();
      return li.removeClass('active');
    });
  };


  /*
  	@method getCurrentPageNumber
  	@returns {number}
   */

  Pagination.prototype.getCurrentPageNumber = function() {
    return this._currentPageNumber;
  };


  /*
  	@method setPageNumber
  	@param {number} pageNumber
  	@param {boolean} [silent=false]
   */

  Pagination.prototype.setPageNumber = function(pageNumber, silent) {
    var direction;
    if (silent == null) {
      silent = false;
    }
    if (!this.triggerPageNumber) {
      direction = pageNumber < this._currentPageNumber ? 'prev' : 'next';
      this.trigger(direction);
    }
    this._currentPageNumber = pageNumber;
    this.render();
    if (!silent) {
      return util.setResetTimeout(500, (function(_this) {
        return function() {
          return _this.trigger('change:pagenumber', pageNumber);
        };
      })(this));
    }
  };

  Pagination.prototype.destroy = function() {
    return this.remove();
  };

  return Pagination;

})(Backbone.View);

module.exports = Pagination;



},{"./main.jade":4,"funcky.util":1}],4:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (step10, pageCount, currentPageNumber, showPageNames) {
if ( (step10 && pageCount >= 10))
{
buf.push("<li title=\"Jump 10 pages back\"" + (jade.cls(['prev10',currentPageNumber>10?'active':''], [null,true])) + ">&laquo;</li>");
}
buf.push("<li title=\"Previous page\"" + (jade.cls(['prev',currentPageNumber>1?'active':''], [null,true])) + ">&lsaquo;</li>");
if ( (showPageNames != null))
{
buf.push("<li class=\"pageNameSingular\">" + (jade.escape(null == (jade_interp = showPageNames[0]) ? "" : jade_interp)) + "</li>");
}
buf.push("<li title=\"Edit current page\" class=\"current\"><input type=\"text\"" + (jade.attr("value", currentPageNumber, true, false)) + "/><span>" + (jade.escape(null == (jade_interp = currentPageNumber) ? "" : jade_interp)) + "</span></li><li class=\"text\">of</li><li class=\"pagecount\">" + (jade.escape(null == (jade_interp = pageCount) ? "" : jade_interp)) + "</li>");
if ( (showPageNames != null))
{
buf.push("<li class=\"pageNamePlural\">" + (jade.escape(null == (jade_interp = showPageNames[1]) ? "" : jade_interp)) + "</li>");
}
buf.push("<li title=\"Next page\"" + (jade.cls(['next',currentPageNumber<pageCount?'active':''], [null,true])) + ">&rsaquo;</li>");
if ( (step10 && pageCount >= 10))
{
buf.push("<li title=\"Jump 10 pages forward\"" + (jade.cls(['next10',currentPageNumber<=pageCount-10?'active':''], [null,true])) + ">&raquo;</li>");
}}.call(this,"step10" in locals_for_with?locals_for_with.step10:typeof step10!=="undefined"?step10:undefined,"pageCount" in locals_for_with?locals_for_with.pageCount:typeof pageCount!=="undefined"?pageCount:undefined,"currentPageNumber" in locals_for_with?locals_for_with.currentPageNumber:typeof currentPageNumber!=="undefined"?currentPageNumber:undefined,"showPageNames" in locals_for_with?locals_for_with.showPageNames:typeof showPageNames!=="undefined"?showPageNames:undefined));;return buf.join("");
};
},{"jade/runtime":2}]},{},[3])
(3)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(_dereq_,module,exports){
(function (global){
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.jade=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Merge two attribute objects giving precedence
 * to values in object `b`. Classes are special-cased
 * allowing for arrays and merging/joining appropriately
 * resulting in a string.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function merge(a, b) {
  if (arguments.length === 1) {
    var attrs = a[0];
    for (var i = 1; i < a.length; i++) {
      attrs = merge(attrs, a[i]);
    }
    return attrs;
  }
  var ac = a['class'];
  var bc = b['class'];

  if (ac || bc) {
    ac = ac || [];
    bc = bc || [];
    if (!Array.isArray(ac)) ac = [ac];
    if (!Array.isArray(bc)) bc = [bc];
    a['class'] = ac.concat(bc).filter(nulls);
  }

  for (var key in b) {
    if (key != 'class') {
      a[key] = b[key];
    }
  }

  return a;
};

/**
 * Filter null `val`s.
 *
 * @param {*} val
 * @return {Boolean}
 * @api private
 */

function nulls(val) {
  return val != null && val !== '';
}

/**
 * join array as classes.
 *
 * @param {*} val
 * @return {String}
 */
exports.joinClasses = joinClasses;
function joinClasses(val) {
  return (Array.isArray(val) ? val.map(joinClasses) :
    (val && typeof val === 'object') ? Object.keys(val).filter(function (key) { return val[key]; }) :
    [val]).filter(nulls).join(' ');
}

/**
 * Render the given classes.
 *
 * @param {Array} classes
 * @param {Array.<Boolean>} escaped
 * @return {String}
 */
exports.cls = function cls(classes, escaped) {
  var buf = [];
  for (var i = 0; i < classes.length; i++) {
    if (escaped && escaped[i]) {
      buf.push(exports.escape(joinClasses([classes[i]])));
    } else {
      buf.push(joinClasses(classes[i]));
    }
  }
  var text = joinClasses(buf);
  if (text.length) {
    return ' class="' + text + '"';
  } else {
    return '';
  }
};


exports.style = function (val) {
  if (val && typeof val === 'object') {
    return Object.keys(val).map(function (style) {
      return style + ':' + val[style];
    }).join(';');
  } else {
    return val;
  }
};
/**
 * Render the given attribute.
 *
 * @param {String} key
 * @param {String} val
 * @param {Boolean} escaped
 * @param {Boolean} terse
 * @return {String}
 */
exports.attr = function attr(key, val, escaped, terse) {
  if (key === 'style') {
    val = exports.style(val);
  }
  if ('boolean' == typeof val || null == val) {
    if (val) {
      return ' ' + (terse ? key : key + '="' + key + '"');
    } else {
      return '';
    }
  } else if (0 == key.indexOf('data') && 'string' != typeof val) {
    if (JSON.stringify(val).indexOf('&') !== -1) {
      console.warn('Since Jade 2.0.0, ampersands (`&`) in data attributes ' +
                   'will be escaped to `&amp;`');
    };
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will eliminate the double quotes around dates in ' +
                   'ISO form after 2.0.0');
    }
    return ' ' + key + "='" + JSON.stringify(val).replace(/'/g, '&apos;') + "'";
  } else if (escaped) {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + exports.escape(val) + '"';
  } else {
    if (val && typeof val.toISOString === 'function') {
      console.warn('Jade will stringify dates in ISO form after 2.0.0');
    }
    return ' ' + key + '="' + val + '"';
  }
};

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 */
exports.attrs = function attrs(obj, terse){
  var buf = [];

  var keys = Object.keys(obj);

  if (keys.length) {
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('class' == key) {
        if (val = joinClasses(val)) {
          buf.push(' ' + key + '="' + val + '"');
        }
      } else {
        buf.push(exports.attr(key, val, false, terse));
      }
    }
  }

  return buf.join('');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  var result = String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  if (result === '' + html) return html;
  else return result;
};

/**
 * Re-throw the given `err` in context to the
 * the jade in `filename` at the given `lineno`.
 *
 * @param {Error} err
 * @param {String} filename
 * @param {String} lineno
 * @api private
 */

exports.rethrow = function rethrow(err, filename, lineno, str){
  if (!(err instanceof Error)) throw err;
  if ((typeof window != 'undefined' || !filename) && !str) {
    err.message += ' on line ' + lineno;
    throw err;
  }
  try {
    str = str || _dereq_('fs').readFileSync(filename, 'utf8')
  } catch (ex) {
    rethrow(err, null, lineno)
  }
  var context = 3
    , lines = str.split('\n')
    , start = Math.max(lineno - context, 0)
    , end = Math.min(lines.length, lineno + context);

  // Error context
  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start + 1;
    return (curr == lineno ? '  > ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'Jade') + ':' + lineno
    + '\n' + context + '\n\n' + err.message;
  throw err;
};

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fs":2}],12:[function(_dereq_,module,exports){
var Backbone, SearchResult, SearchResults, funcky, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

SearchResult = _dereq_('../models/searchresult');

funcky = _dereq_('funcky.req');


/*
 * @class
 * @namespace Collections
 * @uses SearchResult
 */

SearchResults = (function(_super) {
  __extends(SearchResults, _super);

  function SearchResults() {
    return SearchResults.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {SearchResult}
   */

  SearchResults.prototype.model = SearchResult;


  /*
  	 * Init cachedModels in the initialize function, because when defined in the class
  	 * as a property, it is defined on the prototype and thus not refreshed when we instantiate
  	 * a new Collection.
  	 *
  	 * Should be redefined during initialization to prevent sharing between instances.
  	 *
  	 * @property
  	 * @type {Object}
   */

  SearchResults.prototype.cachedModels = null;


  /*
  	 * @construct
  	 * @param {Array<SearchResult>} models
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
   */

  SearchResults.prototype.initialize = function(models, options) {
    this.options = options;
    return this.cachedModels = {};
  };


  /*
  	 * @method
   */

  SearchResults.prototype.clearCache = function() {
    return this.cachedModels = {};
  };


  /*
  	 * @method
   */

  SearchResults.prototype.getCurrent = function() {
    return this._current;
  };


  /*
  	 * @method
  	 * @private
   */

  SearchResults.prototype._setCurrent = function(_current, changeMessage) {
    this._current = _current;
    return this.trigger(changeMessage, this._current);
  };


  /*
  	 * Add the latest search result model to a collection for caching.
  	 *
  	 * @method
  	 * @private
  	 * @param {string} url - Base location of the resultModel. Is used to fetch parts of the result which are not prev or next but at a different place (for example: row 100 - 110) in the result set.
  	 * @param {object} attrs - The properties/attributes of the resultModel.
  	 * @param {string} cacheId - The ID to file the props/attrs under for caching.
  	 * @param {string} changeMessage - The event message to trigger.
   */

  SearchResults.prototype._addModel = function(url, attrs, cacheId, changeMessage) {
    attrs.location = url;
    this.cachedModels[cacheId] = new this.model(attrs);
    this.add(this.cachedModels[cacheId]);
    return this._setCurrent(this.cachedModels[cacheId], changeMessage);
  };


  /*
  	 * @method
  	 * @param {Object} queryOptions
  	 * @param {Object} [options={}]
  	 * @param {Boolean} [options.cache=true] Determines if the result can be fetched from the cachedModels (searchResult models). In case of a reset or a refresh, options.cache is set to false.
   */

  SearchResults.prototype.runQuery = function(queryOptions, options) {
    var changeMessage, queryOptionsString;
    if (options == null) {
      options = {};
    }
    if (options.cache == null) {
      options.cache = true;
    }
    changeMessage = 'change:results';
    queryOptionsString = JSON.stringify(queryOptions);
    if (options.cache && this.cachedModels.hasOwnProperty(queryOptionsString)) {
      return this._setCurrent(this.cachedModels[queryOptionsString], changeMessage);
    } else {
      return this.postQuery(queryOptions, (function(_this) {
        return function(url) {
          var getUrl;
          getUrl = "" + url + "?rows=" + (_this.options.config.get('resultRows'));
          return _this.getResults(getUrl, function(response) {
            return _this._addModel(url, response, queryOptionsString, changeMessage);
          });
        };
      })(this));
    }
  };


  /*
  	 * @method
  	 * @param {String} direction One of "_prev", "_next".
   */

  SearchResults.prototype.moveCursor = function(direction) {
    var changeMessage, url;
    url = direction === '_prev' || direction === '_next' ? this._current.get(direction) : direction;
    changeMessage = 'change:cursor';
    if (url != null) {
      if (this.cachedModels.hasOwnProperty(url)) {
        return this._setCurrent(this.cachedModels[url], changeMessage);
      } else {
        return this.getResults(url, (function(_this) {
          return function(response) {
            return _this._addModel(_this._current.get('location'), response, url, changeMessage);
          };
        })(this));
      }
    }
  };

  SearchResults.prototype.page = function(pagenumber, database) {
    var changeMessage, start, url;
    changeMessage = 'change:page';
    start = this.options.config.get('resultRows') * (pagenumber - 1);
    url = this._current.get('location') + ("?rows=" + (this.options.config.get('resultRows')) + "&start=" + start);
    if (database != null) {
      url += "&database=" + database;
    }
    if (this.cachedModels.hasOwnProperty(url)) {
      return this._setCurrent(this.cachedModels[url], changeMessage);
    } else {
      return this.getResults(url, (function(_this) {
        return function(response) {
          return _this._addModel(_this._current.get('location'), response, url, changeMessage);
        };
      })(this));
    }
  };

  SearchResults.prototype.postQuery = function(queryOptions, done) {
    var ajaxOptions, req;
    this.trigger('request');
    ajaxOptions = {
      data: JSON.stringify(queryOptions)
    };
    if (this.options.config.has('authorizationHeaderToken')) {
      ajaxOptions.headers = {
        Authorization: this.options.config.get('authorizationHeaderToken')
      };
    }
    if (this.options.config.has('requestOptions')) {
      _.extend(ajaxOptions, this.options.config.get('requestOptions'));
    }
    req = funcky.post(this.options.config.get('baseUrl') + this.options.config.get('searchPath'), ajaxOptions);
    req.done((function(_this) {
      return function(res) {
        if (res.status === 201) {
          return done(res.getResponseHeader('Location'));
        }
      };
    })(this));
    return req.fail((function(_this) {
      return function(res) {
        if (res.status === 401) {
          return _this.trigger('unauthorized');
        } else {
          _this.trigger('request:failed', res);
          throw new Error('Failed posting FacetedSearch queryOptions to the server!', res);
        }
      };
    })(this));
  };

  SearchResults.prototype.getResults = function(url, done) {
    var options, req;
    this.trigger('request');
    if (this.options.config.has('authorizationHeaderToken')) {
      options = {
        headers: {
          Authorization: this.options.config.get('authorizationHeaderToken')
        }
      };
    }
    req = funcky.get(url, options);
    req.done((function(_this) {
      return function(res) {
        done(JSON.parse(res.responseText));
        return _this.trigger('sync');
      };
    })(this));
    return req.fail((function(_this) {
      return function(res) {
        if (res.status === 401) {
          return _this.trigger('unauthorized');
        } else {
          _this.trigger('request:failed', res);
          throw new Error('Failed getting FacetedSearch results from the server!', res);
        }
      };
    })(this));
  };

  return SearchResults;

})(Backbone.Collection);

module.exports = SearchResults;



},{"../models/searchresult":19,"funcky.req":8}],13:[function(_dereq_,module,exports){
var Backbone, Config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');


/*
 * @class
 * @namespace Models
 * @todo Move to ./models
 */

Config = (function(_super) {
  __extends(Config, _super);

  function Config() {
    return Config.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * Default attributes.
  	 *
  	 * Does not require any parameters, but the @param tag is (ab)used to document
  	 * the default values.
  	 *
  	 * @method
  	 *
  	 * REQUEST OPTIONS
  	 * @param {String} baseUrl Base of the URL to perform searches.
  	 * @param {String} searchPath Path of the URL to perform searches.
  	 * @param {Number} [resultRows=10] Number of results per query/page.
  	 * @param {String} [authorizationHeaderToken] If set, an Authorization header with given token will be send along with each request.
  	 * @param {Object} [queryOptions={}]
  	 * @param {Array<Object>} [queryOptions.facetValues=[]] Array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
  	 * @param {Array<Object>} [queryOptions.sortParameters=[]] Array of objects containing fieldname and direction: {fieldname: 'language', direction: 'desc'}
  
  	 * @param {Array<String>} [queryOptions.resultFields] List of metadata fields to be returned by the server for every result.
  	 * @param {Object} [requestOptions={}] Send extra options to the POST query call, such as setting custom headers (e.g., VRE_ID for Timbuctoo).
  	 * @param {Array<String>} [entryMetadataFields=[]] A list of all the entries metadata fields. This list corresponds to the facets and is used to populate the sortLevels in the  result view.
  	 * @param {Array<String>} [levels=[]] An array of max three strings. Determine the three levels of sorting the results. The three levels are entry metadata fields and are also present in the entryMetadataFields array.
  	 *
  	 * FACETS OPTIONS
  	 * @param {String} [textSearch='advanced'] One of 'none', 'simple' or 'advanced'. None: text search is hidden, facets are shown, loader is shown. Simple: text search is shown, facets are hidden, loader is hidden. Advanced: text search is shown, facets are shown, loader is shown.
  	 * @param {Object} [textSearchOptions] Options that are passed to the text search component
  	 * @param {Boolean} [textSearchOptions.caseSensitive=false] Render caseSensitive option.
  	 * @param {Boolean} [textSearchOptions.fuzzy=false] Render fuzzy option.
  	 * @param {Array<Object>} [textSearchOptions.fullTextSearchParameters] Search in multiple full text fields. Objects passed have a name and term attribute.
  	 * @param {Boolean} [autoSearch=true] # When set to true, a search is performed whenever the mainModel (queryOptions) change.
  	 * @param {Object} [facetTitleMap={}] Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
  	 * @param {Array<String>} [facetOrder=[]] Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
  	 * @param {Object} [parsers={}] Hash of parser functions. Takes the options from the result and parses the options before rendering. Use sparsely, because with large option lists, the perfomance penalty can become great.
  	 *
  	 * RESULTS OPTIONS
  	 * @param {Boolean} [results=false] Render the results. When kept to false, the showing of the results has to be taken care of in the application.
  	 * @param {Boolean} [sortLevels=true] Render sort levels in the results header
  	 * @param {Boolean} [showMetadata=true] Render show metadata toggle in the results header
  	 *
  	 * OTHER RENDERING OPTIONS
  	 * @param {Object} [templates={}] Hash of templates. The templates should be functions which take a hash as argument to render vars. Possible keys: main, facets, text-search, facets.main, list.menu, list.body and range.body.
  	 * @param {Object} [labels={}] Hash of labels, used in the interface. Quick 'n dirty way to change the language.
  	 * @param {String} [termSingular="entry"] Name of one result, for example: book, woman, country, alumnus, etc.
  	 * @param {String} [termPlural="entries"] Name of multiple results, for example: books, women, countries, alunmi, etc.
  	 *
  	 * @return {Object} A hash of default attributes and their values. Documentated as @param's.
   */

  Config.prototype.defaults = function() {
    return {

      /* REQUEST OPTIONS */
      baseUrl: null,
      searchPath: null,
      resultRows: 10,
      authorizationHeaderToken: null,
      queryOptions: {},
      requestOptions: {},
      entryMetadataFields: [],
      levels: [],

      /* FACETS OPTIONS */
      textSearch: 'advanced',
      textSearchOptions: {
        caseSensitive: false,
        fuzzy: false
      },
      autoSearch: true,
      facetTitleMap: {},
      facetOrder: [],
      parsers: {},

      /* RESULTS OPTIONS */
      results: false,
      sortLevels: true,
      showMetadata: true,

      /* OTHER RENDERING OPTIONS */
      templates: {},
      labels: {
        fullTextSearchFields: "Search in",
        numFound: "Found",
        filterOptions: "Filter options",
        sortAlphabetically: "Sort alphabetically",
        sortNumerically: "Sort numerically"
      },
      termSingular: 'entry',
      termPlural: 'entries'
    };
  };

  return Config;

})(Backbone.Model);

module.exports = Config;



},{}],14:[function(_dereq_,module,exports){
var $, Backbone, BooleanFacet, Config, Facets, ListFacet, MainView, QueryOptions, Results, SearchResults, TextSearch, assert, funcky, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

Backbone.$ = $;

assert = _dereq_('assert');

_ = _dereq_('underscore');

funcky = _dereq_('funcky.el').el;

Config = _dereq_('./config');

QueryOptions = _dereq_('./models/query-options');

SearchResults = _dereq_('./collections/searchresults');

TextSearch = _dereq_('./views/text-search');

Facets = _dereq_('./views/facets');

Results = _dereq_('./views/results');

ListFacet = _dereq_('./views/facets/list');

BooleanFacet = _dereq_('./views/facets/boolean');

tpl = _dereq_('../jade/main.jade');


/*
 * @class
 * @namespace Views
 * @uses Config
 * @uses QueryOptions
 * @uses SearchResults
 * @uses TextSearch
 * @uses Facets
 * @uses Results
 * @uses ListFacet
 * @uses BooleanFacet
 */

MainView = (function(_super) {
  __extends(MainView, _super);

  function MainView() {
    return MainView.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {Facets}
   */

  MainView.prototype.facets = null;


  /*
  	 * @method
  	 * @constructs
  	 * @param {object} [this.options={}]
   */

  MainView.prototype.initialize = function(options) {
    var configOptions;
    this.options = options != null ? options : {};
    configOptions = _.clone(this.options);
    delete configOptions.facetViewMap;
    this.extendConfig(configOptions);
    if (this.config.get('textSearch') === 'simple' || this.config.get('textSearch') === 'advanced') {
      this.initTextSearch();
    }
    this.initQueryOptions();
    this.initSearchResults();
    this.render();
    if (this.config.get('development')) {
      this.searchResults.add(JSON.parse(localStorage.getItem('faceted-search-dev-model')));
      this.searchResults.cachedModels['{"facetValues":[],"sortParameters":[]}'] = this.searchResults.first();
      return setTimeout(((function(_this) {
        return function() {
          return _this.$('.overlay').hide();
        };
      })(this)), 100);
    }
  };


  /*
  	 * @method
  	 * @return {MainView} Instance of MainView to enable chaining.
  	 * @chainable
   */

  MainView.prototype.render = function() {
    if (this.config.get('templates').hasOwnProperty('main')) {
      tpl = this.config.get('templates').main;
    }
    this.el.innerHTML = tpl();
    this.initFacets();
    this.$('.faceted-search').addClass("search-type-" + (this.config.get('textSearch')));
    this.renderTextSearch();
    if (this.config.get('results')) {
      this.renderResults();
    }
    return this;
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.initTextSearch = function() {
    this.textSearch = new TextSearch({
      config: this.config
    });
    this.listenTo(this.textSearch, 'change', (function(_this) {
      return function(queryOptions) {
        return _this.queryOptions.set(queryOptions, {
          silent: true
        });
      };
    })(this));
    return this.listenTo(this.textSearch, 'search', (function(_this) {
      return function() {
        return _this.search();
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.renderTextSearch = function() {
    var textSearchPlaceholder;
    if (this.textSearch == null) {
      return;
    }
    this.textSearch.render();
    textSearchPlaceholder = this.el.querySelector('.text-search-placeholder');
    return textSearchPlaceholder.parentNode.replaceChild(this.textSearch.el, textSearchPlaceholder);
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.renderResults = function() {
    this.$el.addClass('with-results');
    this.results = new Results({
      el: this.$('.results'),
      config: this.config,
      searchResults: this.searchResults
    });
    this.listenTo(this.results, 'result:click', function(data) {
      return this.trigger('result:click', data);
    });
    this.listenTo(this.results, 'result:layer-click', function(layer, data) {
      return this.trigger('result:layer-click', layer, data);
    });
    return this.listenTo(this.results, 'change:sort-levels', function(sortParameters) {
      return this.sortResultsBy(sortParameters);
    });
  };


  /*
  	 * @property
  	 * @type {Object}
   */

  MainView.prototype.events = function() {
    return {
      'click ul.facets-menu li.collapse-expand': function(ev) {
        return this.facets.toggle(ev);
      },
      'click ul.facets-menu li.reset': 'onReset',
      'click ul.facets-menu li.switch button': 'onSwitchType'
    };
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.onSwitchType = function(ev) {
    var textSearch;
    ev.preventDefault();
    textSearch = this.config.get('textSearch') === 'advanced' ? 'simple' : 'advanced';
    this.config.set({
      textSearch: textSearch
    });
    this.$('.faceted-search').toggleClass('search-type-simple');
    this.$('.faceted-search').toggleClass('search-type-advanced');
    if (this.searchResults.length === 1) {
      return this.search();
    } else if (this.searchResults.length > 1) {
      return this.update();
    }
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.onReset = function(ev) {
    ev.preventDefault();
    return this.reset();
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.extendConfig = function(options) {
    var key, toBeExtended, value;
    toBeExtended = {
      facetTitleMap: null,
      textSearchOptions: null,
      labels: null
    };
    for (key in toBeExtended) {
      value = toBeExtended[key];
      toBeExtended[key] = options[key];
      delete options[key];
    }
    this.config = new Config(options);
    for (key in toBeExtended) {
      value = toBeExtended[key];
      this.config.set(key, _.extend(this.config.get(key), value));
    }
    if (['none', 'simple', 'advanced'].indexOf(this.config.get('textSearch')) === -1) {
      this.config.set({
        textSearch: 'advanced'
      });
    }
    return this.listenTo(this.config, 'change:resultRows', (function(_this) {
      return function() {
        return _this.refresh();
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.initQueryOptions = function() {
    var attrs;
    attrs = _.extend(this.config.get('queryOptions'), this.textSearch.model.attributes);
    delete attrs.term;
    this.queryOptions = new QueryOptions(attrs);
    if (this.config.get('autoSearch')) {
      return this.listenTo(this.queryOptions, 'change', (function(_this) {
        return function() {
          return _this.search();
        };
      })(this));
    }
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.initSearchResults = function() {
    this.searchResults = new SearchResults(null, {
      config: this.config
    });
    this.listenToOnce(this.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        var textSearchOptions;
        if (responseModel.has('fullTextSearchFields')) {
          textSearchOptions = _.clone(_this.config.get('textSearchOptions'));
          textSearchOptions.fullTextSearchParameters = responseModel.get('fullTextSearchFields');
          return _this.config.set({
            textSearchOptions: textSearchOptions
          });
        }
      };
    })(this));
    this.listenTo(this.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        if (_this.config.get('textSearch') !== 'simple') {
          _this.update();
        }
        return _this.trigger('change:results', responseModel);
      };
    })(this));
    this.listenTo(this.searchResults, 'change:cursor', (function(_this) {
      return function(responseModel) {
        return _this.trigger('change:cursor', responseModel);
      };
    })(this));
    this.listenTo(this.searchResults, 'change:page', (function(_this) {
      return function(responseModel, database) {
        return _this.trigger('change:page', responseModel, database);
      };
    })(this));
    this.listenTo(this.searchResults, 'request', (function(_this) {
      return function() {
        return _this.showLoader();
      };
    })(this));
    this.listenTo(this.searchResults, 'sync', (function(_this) {
      return function() {
        return _this.hideLoader();
      };
    })(this));
    this.listenTo(this.searchResults, 'unauthorized', (function(_this) {
      return function() {
        return _this.trigger('unauthorized');
      };
    })(this));
    return this.listenTo(this.searchResults, 'request:failed', (function(_this) {
      return function(res) {
        return _this.trigger('request:failed', res);
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.initFacets = function() {
    var facetsPlaceholder;
    this.facets = new Facets({
      viewMap: this.options.facetViewMap,
      config: this.config
    });
    facetsPlaceholder = this.el.querySelector('.facets-placeholder');
    facetsPlaceholder.parentNode.replaceChild(this.facets.el, facetsPlaceholder);
    return this.listenTo(this.facets, 'change', (function(_this) {
      return function(queryOptions, options) {
        return _this.queryOptions.set(queryOptions, options);
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.showLoader = function() {
    var calc, overlay;
    overlay = this.el.querySelector('.overlay');
    if (overlay.style.display === 'block') {
      return false;
    }
    calc = (function(_this) {
      return function() {
        var facetedSearch, fsBox, left, loader, top;
        facetedSearch = _this.el.querySelector('.faceted-search');
        fsBox = funcky(facetedSearch).boundingBox();
        left = (fsBox.left + fsBox.width / 2 - 12) + 'px';
        top = (fsBox.top + fsBox.height / 2 - 12) + 'px';
        if (fsBox.height > window.innerHeight) {
          top = '50vh';
        }
        loader = overlay.children[0];
        loader.style.left = left;
        loader.style.top = top;
        overlay.style.width = fsBox.width + 'px';
        overlay.style.height = fsBox.height + 'px';
        return overlay.style.display = 'block';
      };
    })(this);
    return setTimeout(calc, 0);
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.hideLoader = function() {
    return this.el.querySelector('.overlay').style.display = 'none';
  };


  /*
  	 * @method
  	 * @private
   */

  MainView.prototype.update = function() {
    var facets;
    facets = this.searchResults.getCurrent().get('facets');
    if (this.searchResults.length === 1) {
      return this.facets.renderFacets(facets);
    } else if (this.searchResults.length > 1) {
      return this.facets.update(facets);
    }
  };


  /*
  	 * @method
   */

  MainView.prototype.destroy = function() {
    if (this.facets != null) {
      this.facets.destroy();
    }
    if (this.textSearch != null) {
      this.textSearch.destroy();
    }
    if (this.results != null) {
      this.results.destroy();
    }
    return this.remove();
  };


  /*
  	 * @method
   */

  MainView.prototype.page = function(pagenumber, database) {
    return this.searchResults.page(pagenumber, database);
  };


  /*
  	 * @method
   */

  MainView.prototype.next = function() {
    return this.searchResults.moveCursor('_next');
  };


  /*
  	 * @method
   */

  MainView.prototype.prev = function() {
    return this.searchResults.moveCursor('_prev');
  };


  /*
  	 * @method
   */

  MainView.prototype.hasNext = function() {
    return this.searchResults.getCurrent().has('_next');
  };


  /*
  	 * @method
   */

  MainView.prototype.hasPrev = function() {
    return this.searchResults.getCurrent().has('_prev');
  };


  /*
  	 * Sort the results by the parameters given. The parameters are an array of
  	 * objects, containing 'fieldName' and 'direction': [{fieldName: "name", direction: "desc"}]
  	 * When the queryOptions are set, a change event is triggered and send to the server.
  	 *
  	 * @method
   */

  MainView.prototype.sortResultsBy = function(sortParameters) {
    return this.queryOptions.set({
      sortParameters: sortParameters,
      resultFields: _.pluck(sortParameters, 'fieldname')
    });
  };


  /*
  	 * Silently change @attributes and trigger a change event manually afterwards.
  	 * arguments.cache Boolean Tells searchResults if we want to fetch result from cache.
  	 * 	In an app where data is dynamic, we usually don't want cache (get new result from server),
  	 *	in an app where data is static, we can use cache to speed up the app.
  	 *
  	 * @method
   */

  MainView.prototype.reset = function(cache) {
    if (cache == null) {
      cache = false;
    }
    if (this.textSearch != null) {
      this.textSearch.reset();
    }
    if (this.results != null) {
      this.results.reset();
    }
    this.facets.reset();
    this.queryOptions.reset();
    if (!cache) {
      this.searchResults.clearCache();
    }
    return this.search({
      cache: cache
    });
  };


  /*
  	 * A refresh of the Faceted Search means (re)sending the current @attributes (queryOptions) again.
  	 * We set the cache flag to false, otherwise the searchResults collection will return the cached
  	 * model, instead of fetching a new one from the server.
  	 * The newQueryOptions are optional. The can be used to add or update one or more queryOptions
  	 * before sending the same (or now altered) queryOptions to the server again.
  	 *
  	 * @method
   */

  MainView.prototype.refresh = function(newQueryOptions) {
    if (newQueryOptions == null) {
      newQueryOptions = {};
    }
    if (Object.keys(newQueryOptions).length > 0) {
      this.queryOptions.set(newQueryOptions, {
        silent: true
      });
    }
    return this.search({
      cache: false
    });
  };


  /*
  	 * Run a search query using the queryOptions and given options.
  	 *
  	 * @method
  	 * @param {Object} options
   */

  MainView.prototype.search = function(options) {
    return this.searchResults.runQuery(this.queryOptions.attributes, options);
  };


  /*
  	 * Set a single option in a list or boolean facet and perform a search.
  	 *
  	 * Equivalent to a user resetting the faceted search and selecting one value.
  	 * This is only usable for LIST and BOOLEAN facets.
  	 *
  	 * @method
  	 * @param {String} facetName
  	 * @param value
   */

  MainView.prototype.searchValue = function(facetName, value) {
    var hasProp, isBooleanFacet, isListFacet;
    hasProp = this.facets.views.hasOwnProperty(facetName);
    if (hasProp) {
      isListFacet = this.facets.views[facetName] instanceof ListFacet;
      isBooleanFacet = this.facets.views[facetName] instanceof BooleanFacet;
    }
    if (!hasProp) {
      throw "The facets view doesn't have a \"" + facetName + "\"";
    }
    if (!(isListFacet || isBooleanFacet)) {
      throw "\"facetName\" is not an instance of ListFacet or BooleanFacet";
    }
    this.facets.views[facetName].collection.revert();
    this.facets.views[facetName].collection.get(value).set({
      checked: true,
      visible: true
    });
    this.queryOptions.reset();
    return this.refresh({
      facetValues: [
        {
          name: facetName,
          values: [value]
        }
      ]
    });
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;



},{"../jade/main.jade":43,"./collections/searchresults":12,"./config":13,"./models/query-options":17,"./views/facets":20,"./views/facets/boolean":21,"./views/facets/list":23,"./views/results":34,"./views/text-search":40,"assert":1,"funcky.el":7}],15:[function(_dereq_,module,exports){
var BooleanFacet, FacetModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FacetModel = _dereq_('./main');


/*
 * @class
 * @namespace Models
 */

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @method
  	 * @override FacetModel::set
  	 * @param {String|Object} attrs
  	 * @param {Object} [options]
   */

  BooleanFacet.prototype.set = function(attrs, options) {
    if (attrs === 'options') {
      options = this.parseOptions(options);
    } else if (attrs.hasOwnProperty('options')) {
      attrs.options = this.parseOptions(attrs.options);
    }
    return BooleanFacet.__super__.set.call(this, attrs, options);
  };


  /*
  	 * @method
  	 * @param {Object} options
   */

  BooleanFacet.prototype.parseOptions = function(options) {
    var _ref;
    options = (_ref = this.get('options')) != null ? _ref : options;
    if (options.length === 1) {
      options.push({
        name: (!JSON.parse(options[0].name)).toString(),
        count: 0
      });
    }
    return options;
  };

  return BooleanFacet;

})(FacetModel);

module.exports = BooleanFacet;



},{"./main":16}],16:[function(_dereq_,module,exports){
var Backbone, FacetModel,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');


/*
 * @class
 * @namespace Models
 */

FacetModel = (function(_super) {
  __extends(FacetModel, _super);

  function FacetModel() {
    return FacetModel.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  FacetModel.prototype.idAttribute = 'name';


  /*
  	 * @method
  	 * @return {Object} Hash of default attributes.
   */

  FacetModel.prototype.defaults = function() {
    return {
      name: null,
      title: null,
      type: null,
      options: null
    };
  };

  return FacetModel;

})(Backbone.Model);

module.exports = FacetModel;



},{}],17:[function(_dereq_,module,exports){
var Backbone, QueryOptions, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

QueryOptions = (function(_super) {
  __extends(QueryOptions, _super);

  function QueryOptions() {
    return QueryOptions.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @method
  	 * @override
  	 * @see Config
   */

  QueryOptions.prototype.defaults = function() {
    return {
      facetValues: [],
      sortParameters: []
    };
  };


  /*
  	 * @method
  	 * @override
  	 * @constructs
  	 * @param {Object} this.initialAttributes The initial attributes are stored and not mutated, because on reset the original data is needed.
   */

  QueryOptions.prototype.initialize = function(initialAttributes) {
    this.initialAttributes = initialAttributes;
  };


  /*
  	 * @method
  	 * @override
   */

  QueryOptions.prototype.set = function(attrs, options) {
    var facetValues;
    if (attrs.facetValue != null) {
      facetValues = _.reject(this.get('facetValues'), function(data) {
        return data.name === attrs.facetValue.name;
      });
      if (attrs.facetValue.values != null) {
        if (attrs.facetValue.values.length > 0) {
          facetValues.push(attrs.facetValue);
        }
      } else {
        facetValues.push(attrs.facetValue);
      }
      attrs.facetValues = facetValues;
      delete attrs.facetValue;
    }
    return QueryOptions.__super__.set.call(this, attrs, options);
  };


  /*
  	 * Reset the queryOptions to reflect the initial state.
  	 *
  	 * @method
   */

  QueryOptions.prototype.reset = function() {
    this.clear({
      silent: true
    });
    this.set(this.defaults(), {
      silent: true
    });
    return this.set(this.initialAttributes, {
      silent: true
    });
  };

  return QueryOptions;

})(Backbone.Model);

module.exports = QueryOptions;



},{}],18:[function(_dereq_,module,exports){
var Backbone, SearchModel, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

SearchModel = (function(_super) {
  __extends(SearchModel, _super);

  function SearchModel() {
    return SearchModel.__super__.constructor.apply(this, arguments);
  }

  return SearchModel;

})(Backbone.Model);

module.exports = SearchModel;



},{}],19:[function(_dereq_,module,exports){
var Backbone, SearchResult, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

SearchResult = (function(_super) {
  __extends(SearchResult, _super);

  function SearchResult() {
    return SearchResult.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @method
  	 * @return {Object} Hash of default attributes.
   */

  SearchResult.prototype.defaults = function() {
    return {
      _next: null,
      _prev: null,
      ids: [],
      numFound: null,
      results: [],
      rows: null,
      solrquery: '',
      sortableFields: [],
      start: null,
      facets: []
    };
  };

  return SearchResult;

})(Backbone.Model);

module.exports = SearchResult;



},{}],20:[function(_dereq_,module,exports){
var $, Backbone, Facets, assert, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

$ = _dereq_('jquery');

assert = _dereq_('assert');


/*
 * @class
 * @namespace Views
 * @uses Config
 */

Facets = (function(_super) {
  __extends(Facets, _super);

  function Facets() {
    this._renderFacet = __bind(this._renderFacet, this);
    return Facets.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  Facets.prototype.className = 'facets';


  /*
  	 * Hash of facet views. The faceted search has several types build-in,
  	 * which are the defaults, but this map can be extended, to add or override
  	 * facet views.
  	 *
  	 * @property
  	 * @type {Object} Keys are types in capital, values are Backbone.Views.
  	 * @example {BOOLEAN: MyBooleanView, LIST: MyListView}
  	 * @todo Move to external module.
   */

  Facets.prototype.viewMap = {
    BOOLEAN: _dereq_('./facets/boolean'),
    RANGE: _dereq_('./facets/range'),
    LIST: _dereq_('./facets/list')
  };


  /*
  	 * @property
  	 * @type {Object}
   */

  Facets.prototype.views = null;


  /*
  	 * @constructs
  	 * @param {Object} this.options
  	 * @param {Object} this.options.viewMap
  	 * @param {Config} this.options.config
   */

  Facets.prototype.initialize = function(options) {
    this.options = options;
    _.extend(this.viewMap, this.options.viewMap);
    this.views = {};
    return this.render();
  };


  /*
  	 * @method
  	 * @override
  	 * @chainable
  	 * @return {Facets} Instance of Facets to enable chaining.
   */

  Facets.prototype.render = function() {
    var tpl;
    if (this.options.config.get('templates').hasOwnProperty('facets')) {
      tpl = this.options.config.get('templates').facets;
      this.el.innerHTML = tpl();
    }
    return this;
  };


  /*
  	 * @method
  	 * @param {Object} data
   */

  Facets.prototype.renderFacets = function(data) {
    var facet, facetData, facetName, facets, fragment, index, placeholder, _i, _j, _len, _len1, _ref;
    this._destroyFacets();
    if (this.options.config.get('templates').hasOwnProperty('facets')) {
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        facetData = data[index];
        if (this.viewMap.hasOwnProperty(facetData.type)) {
          placeholder = this.el.querySelector("." + facetData.name + "-placeholder");
          if (placeholder != null) {
            placeholder.parentNode.replaceChild(this._renderFacet(facetData).el, placeholder);
          }
        }
      }
    } else {
      facets = new Backbone.Collection(data, {
        model: Backbone.Model.extend({
          idAttribute: 'name'
        })
      });
      if (this.options.config.get('facetOrder').length === 0) {
        this.options.config.set({
          facetOrder: facets.pluck('name')
        });
      }
      fragment = document.createDocumentFragment();
      _ref = this.options.config.get('facetOrder');
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        facetName = _ref[_j];
        assert.ok(facets.get(facetName) != null, "FacetedSearch :: config.facetOrder : Unknown facet name: \"" + facetName + "\"!");
        facet = facets.get(facetName);
        if (this.viewMap.hasOwnProperty(facet.get('type'))) {
          fragment.appendChild(this._renderFacet(facet.attributes).el);
        } else {
          console.error('Unknown facetView', facet.get('type'));
        }
      }
      this.el.innerHTML = '';
      this.el.appendChild(fragment);
      this._postRenderFacets();
    }
    return this;
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Object} facetData
   */

  Facets.prototype._renderFacet = function(facetData) {
    var View;
    if (_.isString(facetData)) {
      facetData = _.findWhere(this.searchResults.first().get('facets'), {
        name: facetData
      });
    }
    View = this.viewMap[facetData.type];
    this.views[facetData.name] = new View({
      attrs: facetData,
      config: this.options.config
    });
    this.listenTo(this.views[facetData.name], 'change', (function(_this) {
      return function(queryOptions, options) {
        if (options == null) {
          options = {};
        }
        return _this.trigger('change', queryOptions, options);
      };
    })(this));
    return this.views[facetData.name];
  };


  /*
  	 * @method
  	 * @private
   */

  Facets.prototype._postRenderFacets = function() {
    var facetName, view, _ref, _results;
    _ref = this.views;
    _results = [];
    for (facetName in _ref) {
      view = _ref[facetName];
      _results.push(view.postRender());
    }
    return _results;
  };


  /*
  	 * @method
  	 * @param {Object} facetData
   */

  Facets.prototype.update = function(facetData) {
    var data, options, view, viewName, _ref, _results;
    _ref = this.views;
    _results = [];
    for (viewName in _ref) {
      if (!__hasProp.call(_ref, viewName)) continue;
      view = _ref[viewName];
      data = _.findWhere(facetData, {
        name: viewName
      });
      options = data != null ? data.options : [];
      _results.push(view.update(options));
    }
    return _results;
  };


  /*
  	 * @method
   */

  Facets.prototype.reset = function() {
    var facetView, key, _ref, _results;
    _ref = this.views;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      facetView = _ref[key];
      if (typeof facetView.reset === 'function') {
        _results.push(facetView.reset());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };


  /*
  	 * @method
  	 * @private
   */

  Facets.prototype._destroyFacets = function() {
    var view, viewName, _ref, _results;
    this.stopListening();
    _ref = this.views;
    _results = [];
    for (viewName in _ref) {
      if (!__hasProp.call(_ref, viewName)) continue;
      view = _ref[viewName];
      view.destroy();
      _results.push(delete this.views[viewName]);
    }
    return _results;
  };


  /*
  	 * Destroy the child views (facets) and remove the view.
  	 *
  	 * @method
   */

  Facets.prototype.destroy = function() {
    this._destroyFacets();
    return this.remove();
  };


  /*
  	 * The facets are slided one by one. When the slide of a facet is finished, the
  	 * next facet starts sliding. That's why we use a recursive function.
  	 *
  	 * @method
  	 * @param {Object} ev The event object.
   */

  Facets.prototype.toggle = function(ev) {
    var facetNames, icon, index, open, slideFacet, span, text;
    ev.preventDefault();
    icon = $(ev.currentTarget).find('i.fa');
    span = $(ev.currentTarget).find('span');
    open = icon.hasClass('fa-expand');
    icon.toggleClass('fa-compress');
    icon.toggleClass('fa-expand');
    text = open ? 'Collapse' : 'Expand';
    span.text("" + text + " filters");
    facetNames = _.keys(this.views);
    index = 0;
    slideFacet = (function(_this) {
      return function() {
        var facet, facetName;
        facetName = facetNames[index++];
        facet = _this.views[facetName];
        if (facet != null) {
          if (open) {
            return facet.showBody(function() {
              return slideFacet();
            });
          } else {
            return facet.hideBody(function() {
              return slideFacet();
            });
          }
        }
      };
    })(this);
    return slideFacet();
  };

  return Facets;

})(Backbone.View);

module.exports = Facets;



},{"./facets/boolean":21,"./facets/list":23,"./facets/range":32,"assert":1}],21:[function(_dereq_,module,exports){
var $, BooleanFacet, Models, Views, bodyTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Models = {
  Boolean: _dereq_('../../models/facets/boolean')
};

Views = {
  Facet: _dereq_('./main')
};

bodyTpl = _dereq_('../../../jade/facets/boolean.body.jade');


/*
 * @class
 * @namespace Views
 */

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }


  /*
   * @property
   * @type {String}
   */

  BooleanFacet.prototype.className = 'facet boolean';

  BooleanFacet.prototype.initialize = function(options) {
    BooleanFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.Boolean(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  BooleanFacet.prototype.render = function() {
    var rtpl;
    BooleanFacet.__super__.render.apply(this, arguments);
    rtpl = bodyTpl(_.extend(this.model.attributes, {
      ucfirst: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }));
    this.$('.body').html(rtpl);
    this.$('header i.fa').remove();
    return this;
  };

  BooleanFacet.prototype.events = function() {
    return _.extend({}, BooleanFacet.__super__.events.apply(this, arguments), {
      'click i': 'checkChanged',
      'click label': 'checkChanged'
    });
  };

  BooleanFacet.prototype.checkChanged = function(ev) {
    var $target, option, value, _i, _len, _ref;
    $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
    $target.toggleClass('fa-square-o');
    $target.toggleClass('fa-check-square-o');
    value = $target.attr('data-value');
    _ref = this.model.get('options');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      if (option.name === value) {
        option.checked = $target.hasClass('fa-check-square-o');
      }
    }
    return this.trigger('change', {
      facetValue: {
        name: this.model.get('name'),
        values: _.map(this.$('i.fa-check-square-o'), function(cb) {
          return cb.getAttribute('data-value');
        })
      }
    });
  };

  BooleanFacet.prototype.update = function(newOptions) {
    return this.model.set('options', newOptions);
  };

  BooleanFacet.prototype.reset = function() {
    return this.render();
  };

  return BooleanFacet;

})(Views.Facet);

module.exports = BooleanFacet;



},{"../../../jade/facets/boolean.body.jade":41,"../../models/facets/boolean":15,"./main":30}],22:[function(_dereq_,module,exports){
var Backbone, ListOption, ListOptions, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

ListOption = _dereq_('../models/option.coffee');


/*
 * @class
 * @namespace Collections
 * @uses ListOption
 */

ListOptions = (function(_super) {
  __extends(ListOptions, _super);

  function ListOptions() {
    return ListOptions.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type ListOption
   */

  ListOptions.prototype.model = ListOption;


  /*
  	 * Default sorting strategy.
  	 *
  	 * @property
  	 * @type {Function}
   */

  ListOptions.prototype.comparator = null;


  /*
  	 * @method
  	 * @construct
   */

  ListOptions.prototype.initialize = function() {
    return this.comparator = this.strategies.amount_desc;
  };


  /*
  	 * Alias for reset, because a Backbone.Collection already has a reset method.
  	 *
  	 * @method
   */

  ListOptions.prototype.revert = function() {
    this.comparator = this.strategies.amount_desc;
    return this.each((function(_this) {
      return function(option) {
        return option.set('checked', false, {
          silent: true
        });
      };
    })(this));
  };


  /*
  	 * @method
  	 * @param {Array<Object>} [newOptions=[]] Only the new options which have a count greater than zero are passed for the update. List of {count: Number, name: String}.
  	 * @todo Don't do two loops, combine into one.
   */

  ListOptions.prototype.update = function(newOptions) {
    if (newOptions == null) {
      newOptions = [];
    }
    this.each((function(_this) {
      return function(option) {
        return option.set('count', 0, {
          silent: true
        });
      };
    })(this));
    _.each(newOptions, (function(_this) {
      return function(newOption) {
        var opt;
        opt = _this.get(newOption.name);
        if (opt != null) {
          return opt.set('count', newOption.count, {
            silent: true
          });
        } else {
          opt = new ListOption(newOption);
          return _this.add(opt);
        }
      };
    })(this));
    return this.sort();
  };


  /*
  	 * Hash of sorting strategies.
  	 *
  	 * @property
  	 * @type {Object}
   */

  ListOptions.prototype.strategies = {
    alpha_asc: function(model) {
      return +(!model.get('visible')) + (+(!model.get('count')) + model.get('name'));
    },
    alpha_desc: function(model) {
      var str;
      str = String.fromCharCode.apply(String, _.map(model.get('name').split(''), function(c) {
        return 0xffff - c.charCodeAt();
      }));
      return +(!model.get('visible')) + (+(!model.get('count')) + str);
    },
    amount_asc: function(model) {
      var cnt, tmp;
      tmp = model.get('visible') ? 0 : 10;
      tmp += +(!model.get('count'));
      cnt = model.get('count') === 0 ? model.get('total') : model.get('count');
      return tmp -= 1 / cnt;
    },
    amount_desc: function(model) {
      var cnt, tmp;
      tmp = model.get('visible') ? 0 : 10;
      tmp += +(!model.get('count'));
      cnt = model.get('count') === 0 ? model.get('total') : model.get('count');
      return tmp += 1 / cnt;
    }
  };


  /*
  	 * @method
  	 * @param {Function} strategy One of the sorting strategy functions
  	 * @param {Boolean} [silent=false] Set to true to disable the triggering of the sort event.
   */

  ListOptions.prototype.orderBy = function(strategy, silent) {
    if (silent == null) {
      silent = false;
    }
    this.comparator = this.strategies[strategy];
    return this.sort({
      silent: silent
    });
  };


  /*
  	 * Set all options to visible and sort afterwards.
  	 *
  	 * @method
   */

  ListOptions.prototype.setAllVisible = function() {
    this.each(function(model) {
      return model.set('visible', true);
    });
    return this.sort();
  };

  return ListOptions;

})(Backbone.Collection);

module.exports = ListOptions;



},{"../models/option.coffee":25}],23:[function(_dereq_,module,exports){
var $, FacetView, List, ListFacet, ListFacetOptions, ListOptions, menuTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

List = _dereq_('./models/list');

ListOptions = _dereq_('./collections/options');

FacetView = _dereq_('../main');

ListFacetOptions = _dereq_('./options');

menuTpl = _dereq_('./templates/menu.jade');


/*
 * @class
 * @namespace Views
 * @uses ListFacetOptions
 * @uses ListOptions
 * @uses List
 */

ListFacet = (function(_super) {
  __extends(ListFacet, _super);

  function ListFacet() {
    return ListFacet.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  ListFacet.prototype.className = 'facet list';


  /*
  	 * @method
  	 * @construct
  	 * @override FacetView::initialize
  	 * @param {Object} this.options
   */

  ListFacet.prototype.initialize = function(options) {
    var facetData;
    this.options = options;
    ListFacet.__super__.initialize.apply(this, arguments);
    this.resetActive = false;
    this.model = new List(this.options.attrs, {
      parse: true
    });
    facetData = this._parseFacetData(this.options.attrs);
    this.collection = new ListOptions(facetData.options, {
      parse: true
    });
    return this.render();
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Object} facetData
  	 * @return {Object} Parsed facet data
   */

  ListFacet.prototype._parseFacetData = function(facetData) {
    var parsers;
    parsers = this.options.config.get('parsers');
    if (parsers.hasOwnProperty(facetData.name)) {
      facetData = parsers[facetData.name](facetData);
    }
    return facetData;
  };


  /*
  	 * @method
  	 * @override FacetView::render
  	 * @chainable
  	 * @return {ListFacet} Instance of ListFacet to enable chaining.
   */

  ListFacet.prototype.render = function() {
    var menu;
    ListFacet.__super__.render.apply(this, arguments);
    if (this.$('header .options').length > 0) {
      if (this.options.config.get('templates').hasOwnProperty('list.menu')) {
        menuTpl = this.options.config.get('templates')['list.menu'];
      }
      menu = menuTpl({
        model: this.model.attributes
      });
      this.$('header .options').html(menu);
    }
    this.optionsView = new ListFacetOptions({
      collection: this.collection,
      facetName: this.model.get('name'),
      config: this.options.config
    });
    this.$('.body').html(this.optionsView.el);
    this.listenTo(this.optionsView, 'filter:finished', this.renderFilteredOptionCount);
    this.listenTo(this.optionsView, 'change', (function(_this) {
      return function(data) {
        return _this.trigger('change', data);
      };
    })(this));
    if (this.collection.length <= 3) {
      this.$('header i.openclose').hide();
    }
    return this;
  };


  /*
  	 * @method
  	 * @override FacetView::postRender
   */

  ListFacet.prototype.postRender = function() {
    var el;
    el = this.el.querySelector('.body > .container');
    if (el.scrollHeight > el.clientHeight) {
      return this.$el.addClass('with-scrollbar');
    }
  };


  /*
  	 * Renders the count of the filtered options (ie: "3 of 8") next to the filter < input >
  	 *
  	 * @method
   */

  ListFacet.prototype.renderFilteredOptionCount = function() {
    var filteredModels, value, visibleModels, _ref;
    visibleModels = this.collection.filter(function(model) {
      return model.get('visible');
    });
    value = (0 < (_ref = visibleModels.length) && _ref < 21) ? 'visible' : 'hidden';
    this.$('input[type="checkbox"][name="all"]').css('visibility', value);
    filteredModels = this.collection.filter(function(model) {
      return model.get('visible');
    });
    if (filteredModels.length === 0 || filteredModels.length === this.collection.length) {
      this.$('header .options input[name="filter"]').addClass('nonefound');
    } else {
      this.$('header .options input[name="filter"]').removeClass('nonefound');
    }
    this.$('header small.optioncount').html(filteredModels.length + ' of ' + this.collection.length);
    return this;
  };


  /*
  	 * Extend the events of Facet with ListFacet events.
  	 *
  	 * @method
  	 * @override FacetView::events
  	 * @type {Object}
  	 * @return {Object}
   */

  ListFacet.prototype.events = function() {
    return _.extend({}, ListFacet.__super__.events.apply(this, arguments), {
      'keyup input[name="filter"]': function(ev) {
        return this.optionsView.filterOptions(ev.currentTarget.value);
      },
      'change header .options input[type="checkbox"][name="all"]': function(ev) {
        return this.optionsView.setCheckboxes(ev);
      },
      'click header .menu i.filter': '_toggleFilterMenu',
      'click header .menu i.alpha': '_changeOrder',
      'click header .menu i.amount': '_changeOrder'
    });
  };


  /*
  	 * @method
  	 * @private
   */

  ListFacet.prototype._toggleFilterMenu = function() {
    var filterIcon, optionsDiv;
    optionsDiv = this.$('header .options');
    filterIcon = this.$('i.filter');
    filterIcon.toggleClass('active');
    return optionsDiv.slideToggle(150, (function(_this) {
      return function() {
        var input;
        input = optionsDiv.find('input[name="filter"]');
        if (filterIcon.hasClass('active')) {
          input.focus();
          _this.optionsView.appendOptions(true);
          return _this.renderFilteredOptionCount();
        } else {
          input.val('');
          return _this.collection.setAllVisible();
        }
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Object} ev The event object.
   */

  ListFacet.prototype._changeOrder = function(ev) {
    var $target, order, type;
    if (!this.$('i.filter').hasClass('active')) {
      this.optionsView.renderAll();
    }
    $target = $(ev.currentTarget);
    if ($target.hasClass('active')) {
      if ($target.hasClass('alpha')) {
        $target.toggleClass('fa-sort-alpha-desc');
        $target.toggleClass('fa-sort-alpha-asc');
      } else if ($target.hasClass('amount')) {
        $target.toggleClass('fa-sort-amount-desc');
        $target.toggleClass('fa-sort-amount-asc');
      }
    } else {
      this.$('i.amount.active').removeClass('active');
      this.$('i.alpha.active').removeClass('active');
      $target.addClass('active');
    }
    type = $target.hasClass('alpha') ? 'alpha' : 'amount';
    order = $target.hasClass('fa-sort-' + type + '-desc') ? 'desc' : 'asc';
    return this.collection.orderBy(type + '_' + order);
  };


  /*
  	 * @method
  	 * @override FacetView::update
  	 * @param {Object} newOptions
   */

  ListFacet.prototype.update = function(newOptions) {
    var facetData;
    if (this.resetActive) {
      facetData = this._parseFacetData({
        options: newOptions,
        name: this.options.attrs.name
      });
      this.collection.reset(facetData.options, {
        parse: true
      });
      return this.resetActive = false;
    } else {
      return this.collection.update(newOptions);
    }
  };


  /*
  	 * @method
  	 * @override FacetView::reset
   */

  ListFacet.prototype.reset = function() {
    this.resetActive = true;
    if (this.$('i.filter').hasClass('active')) {
      return this._toggleFilterMenu();
    }
  };


  /*
  	 * Alias for reset, but used for different implementation. This should be the base
  	 * of the original reset, but no time for proper refactor.
  	 *
  	 * @method
  	 * @todo refactor @reset.
   */

  ListFacet.prototype.revert = function() {
    if (this.$('i.filter').hasClass('active')) {
      this._toggleFilterMenu();
    }
    this.collection.revert();
    return this.collection.sort();
  };

  return ListFacet;

})(FacetView);

module.exports = ListFacet;



},{"../main":30,"./collections/options":22,"./models/list":24,"./options":26,"./templates/menu.jade":28}],24:[function(_dereq_,module,exports){
var FacetModel, List,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FacetModel = _dereq_('../../../../models/facets/main');


/*
 * @class
 * @namespace Models
 */

List = (function(_super) {
  __extends(List, _super);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  return List;

})(FacetModel);

module.exports = List;



},{"../../../../models/facets/main":16}],25:[function(_dereq_,module,exports){
var Backbone, ListOption,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');


/*
 * @class
 * @namespace Models
 */

ListOption = (function(_super) {
  __extends(ListOption, _super);

  function ListOption() {
    return ListOption.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  ListOption.prototype.idAttribute = 'name';


  /*
  	 * @method
  	 * @return {Object} Hash of default attributes
   */

  ListOption.prototype.defaults = function() {
    return {
      name: '',
      displayName: null,
      count: 0,
      total: 0,
      checked: false,
      visible: false
    };
  };


  /*
  	 * @method
  	 * @param {Object} attrs
   */

  ListOption.prototype.parse = function(attrs) {
    attrs.total = attrs.count;
    return attrs;
  };

  return ListOption;

})(Backbone.Model);

module.exports = ListOption;



},{}],26:[function(_dereq_,module,exports){
var $, Backbone, ListFacetOptions, bodyTpl, funcky, optionTpl, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

funcky = _dereq_('funcky.util');

bodyTpl = _dereq_('./templates/body.jade');

optionTpl = _dereq_('./templates/option.jade');


/*
 * @class
 * @namespace Views
 */

ListFacetOptions = (function(_super) {
  __extends(ListFacetOptions, _super);

  function ListFacetOptions() {
    this.triggerChange = __bind(this.triggerChange, this);
    return ListFacetOptions.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  ListFacetOptions.prototype.className = 'container';


  /*
  	 * @method
  	 * @construct
   */

  ListFacetOptions.prototype.initialize = function(options) {
    this.config = options.config;
    this.facetName = options.facetName;
    this.listenTo(this.collection, 'sort', (function(_this) {
      return function() {
        return _this.rerender();
      };
    })(this));
    this.listenTo(this.collection, 'reset', (function(_this) {
      return function() {
        _this.collection.orderBy('amount_desc', true);
        return _this.render();
      };
    })(this));
    if (this.config.get('templates').hasOwnProperty('list.option')) {
      optionTpl = this.config.get('templates')['list.option'];
    }
    return this.render();
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {ListFacetOptions}
   */

  ListFacetOptions.prototype.render = function() {
    this.showingCursor = 0;
    this.showingIncrement = 50;
    if (this.config.get('templates').hasOwnProperty('list.body')) {
      bodyTpl = this.config.get('templates')['list.body'];
    }
    this.$el.html(bodyTpl({
      facetName: this.facetName
    }));
    this.appendOptions();
    return this;
  };


  /*
  	 * @method
   */

  ListFacetOptions.prototype.rerender = function() {
    var i, model, tpl, visible;
    tpl = '';
    i = 0;
    model = this.collection.at(i);
    visible = model.get('visible');
    while (visible) {
      tpl += optionTpl({
        option: model
      });
      i = i + 1;
      model = this.collection.at(i);
      visible = (model != null) && model.get('visible') ? true : false;
    }
    return this.el.querySelector('ul').innerHTML = tpl;
  };


  /*
  	 * @method
  	 * @param {Boolean} all
   */

  ListFacetOptions.prototype.appendOptions = function(all) {
    var model, tpl;
    if (all == null) {
      all = false;
    }
    if (all) {
      this.showingIncrement = this.collection.length;
    }
    tpl = '';
    while (this.showingCursor < this.showingIncrement && this.showingCursor < this.collection.length) {
      model = this.collection.at(this.showingCursor);
      model.set('visible', true);
      tpl += optionTpl({
        option: model
      });
      this.showingCursor = this.showingCursor + 1;
    }
    return this.$('ul').append(tpl);
  };


  /*
  	 * @method
   */

  ListFacetOptions.prototype.renderAll = function() {
    return this.collection.setAllVisible();
  };


  /*
  	 * @method
  	 * @return {Object} Hash of events.
   */

  ListFacetOptions.prototype.events = function() {
    return {
      'click li': 'checkChanged',
      'scroll': 'onScroll'
    };
  };


  /*
  	 * When scolling lazy render the rest of the options. This speeds up page load.
  	 *
  	 * @method
  	 * @param {Object} ev
   */

  ListFacetOptions.prototype.onScroll = function(ev) {
    var target, topPerc;
    if (this.showingCursor < this.collection.length) {
      target = ev.currentTarget;
      topPerc = target.scrollTop / target.scrollHeight;
      if (topPerc > (this.showingCursor / 2) / this.collection.length) {
        this.showingIncrement += this.showingIncrement;
        return this.appendOptions();
      }
    }
  };


  /*
  	 * @method
   */

  ListFacetOptions.prototype.checkChanged = function(ev) {
    var $target, id;
    $target = $(ev.currentTarget);
    id = $target.attr('data-value');
    $target.toggleClass('checked');
    this.collection.get(id).set('checked', $target.hasClass('checked'));
    if (this.$('li.checked').length === 0 || !this.config.get('autoSearch')) {
      return this.triggerChange();
    } else {
      return funcky.setResetTimeout(1000, (function(_this) {
        return function() {
          return _this.triggerChange();
        };
      })(this));
    }
  };


  /*
  	 * @method
  	 * @param {Array<Object>} values
   */

  ListFacetOptions.prototype.triggerChange = function(values) {
    var checkedModels;
    if (values == null) {
      checkedModels = this.collection.filter(function(item) {
        return item.get('checked');
      });
      values = _.map(checkedModels, function(item) {
        return item.get('name');
      });
    }
    return this.trigger('change', {
      facetValue: {
        name: this.facetName,
        values: values
      }
    });
  };


  /*
  	 * Called by parent (ListFacet) when user types in the search input
  	 *
  	 * @method
  	 * @param {String} value Query to filter results on.
   */

  ListFacetOptions.prototype.filterOptions = function(value) {
    this.collection.map(function(model) {
      var re;
      re = new RegExp(value, 'i');
      return model.set('visible', re.test(model.id));
    });
    this.collection.sort();
    return this.trigger('filter:finished');
  };


  /*
  	 * @method
  	 * @param {Object} ev
   */

  ListFacetOptions.prototype.setCheckboxes = function(ev) {
    var model, values, visibleModels, _i, _len;
    visibleModels = this.collection.filter(function(model) {
      return model.get('visible');
    });
    for (_i = 0, _len = visibleModels.length; _i < _len; _i++) {
      model = visibleModels[_i];
      model.set('checked', ev.currentTarget.checked);
    }
    if (ev.currentTarget.checked) {
      values = _.map(visibleModels, function(item) {
        return item.get('name');
      });
      return this.triggerChange(values);
    } else {
      return this.triggerChange();
    }
  };

  return ListFacetOptions;

})(Backbone.View);

module.exports = ListFacetOptions;



},{"./templates/body.jade":27,"./templates/option.jade":29,"funcky.util":9}],27:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<ul></ul>");;return buf.join("");
};
},{"jade/runtime":11}],28:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<input type=\"checkbox\" name=\"all\"/><input type=\"text\" name=\"filter\"/><small class=\"optioncount\"></small>");;return buf.join("");
};
},{"jade/runtime":11}],29:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (option) {
var displayName = option.id
if ( option.id === ':empty' || option.id === '(empty)')
{
displayName = '<em>(empty)</em>'
}
if ( option.get('displayName') != null)
{
displayName = option.get('displayName')
}
buf.push("<li" + (jade.attr("data-count", option.get('count'), true, false)) + (jade.attr("data-value", option.id, true, false)) + (jade.cls([option.get('checked')?'checked':null], [true])) + "><i" + (jade.attr("data-value", option.id, true, false)) + " class=\"unchecked fa fa-square-o\"></i><i" + (jade.attr("data-value", option.id, true, false)) + " class=\"checked fa fa-check-square-o\"></i><label" + (jade.attr("data-value", option.id, true, false)) + ">" + (null == (jade_interp = displayName) ? "" : jade_interp) + "</label><div class=\"count\">" + (jade.escape(null == (jade_interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade_interp)) + "</div></li>");}.call(this,"option" in locals_for_with?locals_for_with.option:typeof option!=="undefined"?option:undefined));;return buf.join("");
};
},{"jade/runtime":11}],30:[function(_dereq_,module,exports){
var $, Backbone, FacetView, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

tpl = _dereq_('../../../jade/facets/main.jade');


/*
 * @class
 * @abstract
 * @namespace Views
 */

FacetView = (function(_super) {
  __extends(FacetView, _super);

  function FacetView() {
    return FacetView.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @method
  	 * @construct
  	 * @override
  	 * @param {Object} options
   */

  FacetView.prototype.initialize = function(options) {
    this.config = options.config;
    if (this.config.get('facetTitleMap').hasOwnProperty(options.attrs.name)) {
      return options.attrs.title = this.config.get('facetTitleMap')[options.attrs.name];
    }
  };


  /*
  	 * @method
  	 * @override
  	 * @return {FacetView} Instance of FacetView to enable chaining.
   */

  FacetView.prototype.render = function() {
    if (this.config.get('templates').hasOwnProperty('facets.main')) {
      tpl = this.config.get('templates')['facets.main'];
    }
    this.$el.html(tpl({
      model: this.model,
      config: this.config
    }));
    this.$el.attr('data-name', this.model.get('name'));
    return this;
  };


  /*
  	 * @property
  	 * @override
  	 * @type {Object}
   */

  FacetView.prototype.events = function() {
    return {
      'click h3': '_toggleBody'
    };
  };


  /*
  	 * This method is called when the facet has to be updated. For instance after
  	 * the server has returned with new values.
  	 *
  	 * @method
  	 * @abstract
  	 * @param {Object} newOptions
   */

  FacetView.prototype.update = function(newOptions) {};


  /*
  	 * Reset the facet to it's initial state.
  	 *
  	 * @method
  	 * @abstract
   */

  FacetView.prototype.reset = function() {};


  /*
  	 * The postRender method is being run after render.
  	 *
  	 * @method
  	 * @abstract
   */

  FacetView.prototype.postRender = function() {};


  /*
  	 * Every facet can be minimized by clicking the title of the facet.
  	 *
  	 * @method
  	 * @private
  	 * @param {Object} ev The event object.
   */

  FacetView.prototype._toggleBody = function(ev) {
    var func;
    func = this.$('.body').is(':visible') ? this._hideBody : this._showBody;
    if (_.isFunction(ev)) {
      return func.call(this, ev);
    } else {
      return func.call(this);
    }
  };


  /*
  	 * @method
  	 * @private
   */

  FacetView.prototype._hideMenu = function() {
    var $button;
    $button = this.$('header i.openclose');
    $button.addClass('fa-plus-square-o');
    $button.removeClass('fa-minus-square-o');
    return this.$('header .options').slideUp(150);
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Function} done Callback called when hide body animation has finished.
   */

  FacetView.prototype._hideBody = function(done) {
    this._hideMenu();
    return this.$('.body').slideUp(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeOut(100);
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Function} done Callback called when show body animation has finished.
   */

  FacetView.prototype._showBody = function(done) {
    return this.$('.body').slideDown(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeIn(100);
      };
    })(this));
  };


  /*
  	 * If destroy is not overridden, just call Backbone.View's remove method.
  	 *
  	 * @method
   */

  FacetView.prototype.destroy = function() {
    return this.remove();
  };

  return FacetView;

})(Backbone.View);

module.exports = FacetView;



},{"../../../jade/facets/main.jade":42}],31:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (max, min) {
buf.push("<div class=\"slider\"><span class=\"dash\">-</span><div class=\"handle-min handle\"><input" + (jade.attr("value", min, true, false)) + " class=\"min\"/><label class=\"min\">" + (jade.escape(null == (jade_interp = min) ? "" : jade_interp)) + "</label></div><div class=\"handle-max handle\"><input" + (jade.attr("value", max, true, false)) + " class=\"max\"/><label class=\"max\">" + (jade.escape(null == (jade_interp = max) ? "" : jade_interp)) + "</label></div><div class=\"bar\">&nbsp;</div><button title=\"Search within given range\"><svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 216 146\" xml:space=\"preserve\"><path d=\"M172.77,123.025L144.825,95.08c6.735-9.722,10.104-20.559,10.104-32.508c0-7.767-1.508-15.195-4.523-22.283c-3.014-7.089-7.088-13.199-12.221-18.332s-11.242-9.207-18.33-12.221c-7.09-3.015-14.518-4.522-22.285-4.522c-7.767,0-15.195,1.507-22.283,4.522c-7.089,3.014-13.199,7.088-18.332,12.221c-5.133,5.133-9.207,11.244-12.221,18.332c-3.015,7.089-4.522,14.516-4.522,22.283c0,7.767,1.507,15.193,4.522,22.283c3.014,7.088,7.088,13.197,12.221,18.33c5.133,5.134,11.244,9.207,18.332,12.222c7.089,3.015,14.516,4.522,22.283,4.522c11.951,0,22.787-3.369,32.509-10.104l27.945,27.863c1.955,2.064,4.397,3.096,7.332,3.096c2.824,0,5.27-1.032,7.332-3.096c2.064-2.063,3.096-4.508,3.096-7.332C175.785,127.479,174.781,125.034,172.77,123.025z M123.357,88.357c-7.143,7.143-15.738,10.714-25.787,10.714c-10.048,0-18.643-3.572-25.786-10.714c-7.143-7.143-10.714-15.737-10.714-25.786c0-10.048,3.572-18.644,10.714-25.786c7.142-7.143,15.738-10.714,25.786-10.714c10.048,0,18.643,3.572,25.787,10.714c7.143,7.142,10.715,15.738,10.715,25.786C134.072,72.62,130.499,81.214,123.357,88.357z\"></path></svg></button></div>");}.call(this,"max" in locals_for_with?locals_for_with.max:typeof max!=="undefined"?max:undefined,"min" in locals_for_with?locals_for_with.min:typeof min!=="undefined"?min:undefined));;return buf.join("");
};
},{"jade/runtime":11}],32:[function(_dereq_,module,exports){
var $, FacetView, Range, RangeFacet, bodyTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Range = _dereq_('./model');

FacetView = _dereq_('../main');

bodyTpl = _dereq_('./body.jade');


/*
 * @class
 * @namespace Views
 * @uses Range
 */

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @override FacetView::className
  	 * @type {String}
   */

  RangeFacet.prototype.className = 'facet range';


  /*
  	 * @property
  	 * @type {Boolean}
   */

  RangeFacet.prototype.draggingMin = false;


  /*
  	 * @property
  	 * @type {Boolean}
   */

  RangeFacet.prototype.draggingMax = false;


  /*
  	 * @property
  	 * @type {Range}
   */

  RangeFacet.prototype.model = null;


  /*
  	 * @method
  	 * @override FacetView::initialize
  	 * @construct
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
  	 * @param {Object} this.options.attrs
   */

  RangeFacet.prototype.initialize = function(options) {
    this.options = options;
    RangeFacet.__super__.initialize.apply(this, arguments);
    this.model = new Range(this.options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    this.listenTo(this.model, 'change', (function(_this) {
      return function(model) {
        if (model.changed.hasOwnProperty('currentMin') || model.changed.hasOwnProperty('currentMax')) {
          if ((_this.button != null) && _this.options.config.get('autoSearch')) {
            return _this.button.style.display = 'block';
          }
        }
      };
    })(this));
    this.listenTo(this.model, 'change:handleMinLeft', (function(_this) {
      return function(model, value) {
        _this.handleMin.css('left', value);
        return _this.bar.css('left', value + (_this.model.get('handleWidth') / 2));
      };
    })(this));
    this.listenTo(this.model, 'change:handleMaxLeft', (function(_this) {
      return function(model, value) {
        _this.handleMax.css('left', value);
        return _this.bar.css('right', model.get('sliderWidth') - value - (_this.model.get('handleWidth') / 2));
      };
    })(this));
    this.listenTo(this.model, 'change:currentMin', (function(_this) {
      return function(model, value) {
        return _this.labelMin.html(Math.ceil(value));
      };
    })(this));
    this.listenTo(this.model, 'change:currentMax', (function(_this) {
      return function(model, value) {
        return _this.labelMax.html(Math.ceil(value));
      };
    })(this));
    return this.render();
  };


  /*
  	 * @method
  	 * @override FacetView::render
  	 * @chainable
  	 * @return {RangeFacet}
   */

  RangeFacet.prototype.render = function() {
    var rtpl;
    RangeFacet.__super__.render.apply(this, arguments);
    if (this.options.config.get('templates').hasOwnProperty('range.body')) {
      bodyTpl = this.options.config.get('templates')['range.body'];
    }
    rtpl = bodyTpl(this.model.attributes);
    this.$('.body').html(rtpl);
    this.$('header .menu').hide();
    this.dragStopper = this.stopDragging.bind(this);
    this.$el.on('mouseleave', this.dragStopper);
    this.resizer = this.onResize.bind(this);
    window.addEventListener('resize', this.resizer);
    return this;
  };


  /*
  	 * @method
  	 * @override FacetView::postRender
   */

  RangeFacet.prototype.postRender = function() {
    var slider;
    this.handleMin = this.$('.handle-min');
    this.handleMax = this.$('.handle-max');
    this.labelMin = this.$('label.min');
    this.labelMax = this.$('label.max');
    this.bar = this.$('.bar');
    this.button = this.el.querySelector('button');
    slider = this.$('.slider');
    return this.model.set({
      sliderWidth: slider.width(),
      sliderLeft: slider.offset().left,
      handleMinLeft: this.handleMin.position().left,
      handleMaxLeft: this.handleMax.position().left,
      handleWidth: this.handleMin.width()
    });
  };


  /*
  	 * @method
  	 * @override FacetView::events
   */

  RangeFacet.prototype.events = function() {
    return _.extend({}, RangeFacet.__super__.events.apply(this, arguments), {
      'mousedown .handle': 'startDragging',
      'mousedown .bar': 'startDragging',
      'mouseup': 'stopDragging',
      'mousemove': 'drag',
      'blur input': 'setYear',
      'keyup input': 'setYear',
      'click button': 'doSearch',
      'dblclick label.min': function(ev) {
        return this.enableInputEditable(this.labelMin);
      },
      'dblclick label.max': function(ev) {
        return this.enableInputEditable(this.labelMax);
      }
    });
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  RangeFacet.prototype.setYear = function(ev) {
    if (ev.type === 'focusout' || ev.type === 'blur' || (ev.type === 'keyup' && ev.keyCode === 13)) {
      if (ev.currentTarget.className.indexOf('min') > -1) {
        this.model.set({
          currentMin: +ev.currentTarget.value
        });
        return this.disableInputEditable(this.labelMin);
      } else if (ev.currentTarget.className.indexOf('max') > -1) {
        this.model.set({
          currentMax: +ev.currentTarget.value
        });
        return this.disableInputEditable(this.labelMax);
      }
    }
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  RangeFacet.prototype.doSearch = function(ev) {
    ev.preventDefault();
    return this.triggerChange();
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  RangeFacet.prototype.startDragging = function(ev) {
    var input, target;
    target = $(ev.currentTarget);
    input = target.find('input');
    if (input.length > 0) {
      if (input.hasClass('edit')) {
        return;
      }
    }
    if (target.hasClass('handle-min')) {
      this.draggingMin = true;
      this.handleMax.css('z-index', 10);
      return target.css('z-index', 11);
    } else if (target.hasClass('handle-max')) {
      this.draggingMax = true;
      this.handleMin.css('z-index', 10);
      return target.css('z-index', 11);
    } else if (target.hasClass('bar')) {
      return this.draggingBar = {
        offsetLeft: (ev.clientX - this.model.get('sliderLeft')) - this.model.get('handleMinLeft'),
        barWidth: this.bar.width()
      };
    }
  };


  /*
  	 * Called on every scroll event! Keep optimized!
  	 *
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  RangeFacet.prototype.drag = function(ev) {
    var left, mousePosLeft, right;
    mousePosLeft = ev.clientX - this.model.get('sliderLeft');
    if (this.draggingMin || this.draggingMax) {
      this.disableInputOverlap();
      this.checkInputOverlap();
    }
    if (this.draggingBar != null) {
      this.updateDash();
      left = mousePosLeft - this.draggingBar.offsetLeft;
      right = left + this.draggingBar.barWidth;
      if (-1 < left && right <= this.model.get('sliderWidth')) {
        this.model.dragMin(left);
        this.model.dragMax(right);
      }
    }
    if (this.draggingMin) {
      this.model.dragMin(mousePosLeft - (this.model.get('handleWidth') / 2));
    }
    if (this.draggingMax) {
      return this.model.dragMax(mousePosLeft - (this.model.get('handleWidth') / 2));
    }
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  RangeFacet.prototype.stopDragging = function(ev) {
    if (this.draggingMin || this.draggingMax || (this.draggingBar != null)) {
      if (this.draggingMin) {
        if (this.model.get('currentMin') !== +this.labelMin.html()) {
          this.model.set({
            currentMin: +this.labelMin.html()
          });
        }
      }
      if (this.draggingMax) {
        if (this.model.get('currentMax') !== +this.labelMax.html()) {
          this.model.set({
            currentMax: +this.labelMax.html()
          });
        }
      }
      this.draggingMin = false;
      this.draggingMax = false;
      this.draggingBar = null;
      if (!this.options.config.get('autoSearch')) {
        return this.triggerChange({
          silent: true
        });
      }
    }
  };


  /*
  	 * @method
  	 * @param {Object} label Reference to jquery wrapped label element.
   */

  RangeFacet.prototype.enableInputEditable = function(label) {
    var handle, input;
    handle = label.closest('.handle');
    input = handle.find('input');
    handle.addClass('edit');
    return input.focus().val(label.html());
  };


  /*
  	 * @method
  	 * @param {Object} label Reference to jquery wrapped label element.
   */

  RangeFacet.prototype.disableInputEditable = function(label) {
    var handle;
    handle = label.closest('.handle');
    return handle.removeClass('edit');
  };


  /*
  	 * Before removing the range facet, the global mouseleave and resize event
  	 * listeners have to be removed.
  	 *
  	 * @method
   */

  RangeFacet.prototype.destroy = function() {
    this.$el.off('mouseleave', this.dragStopper);
    window.removeEventListener('resize', this.resizer);
    return this.remove();
  };


  /*
  	 * @method
  	 * @param {Object} [options={}]
   */

  RangeFacet.prototype.triggerChange = function(options) {
    var queryOptions;
    if (options == null) {
      options = {};
    }
    queryOptions = {
      facetValue: {
        name: this.model.get('name'),
        lowerLimit: this.model.getLowerLimit(),
        upperLimit: this.model.getUpperLimit()
      }
    };
    return this.trigger('change', queryOptions, options);
  };


  /*
  	 * @method
   */

  RangeFacet.prototype.onResize = function() {
    this.postRender();
    this.update([
      {
        lowerLimit: this.model.get('currentMin'),
        upperLimit: this.model.get('currentMax')
      }
    ]);
    return this.checkInputOverlap();
  };


  /*
  	 * @method
   */

  RangeFacet.prototype.checkInputOverlap = function() {
    var diff, maxRect, minRect;
    minRect = this.labelMin[0].getBoundingClientRect();
    maxRect = this.labelMax[0].getBoundingClientRect();
    if (!(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)) {
      diff = minRect.right - maxRect.left;
      return this.enableInputOverlap(diff);
    } else {
      return this.disableInputOverlap();
    }
  };


  /*
  	 * @method
  	 * @param {Number} diff Difference in pixels between labelMin and labelMax.
   */

  RangeFacet.prototype.enableInputOverlap = function(diff) {
    this.labelMin.css('left', -20 - diff / 2);
    this.labelMax.css('right', -20 - diff / 2);
    this.updateDash();
    this.$('.dash').show();
    this.labelMin.addClass('overlap');
    return this.labelMax.addClass('overlap');
  };


  /*
  	 * @method
   */

  RangeFacet.prototype.disableInputOverlap = function() {
    this.labelMin.css('left', -20);
    this.labelMax.css('right', -20);
    this.$('.dash').hide();
    this.labelMin.removeClass('overlap');
    return this.labelMax.removeClass('overlap');
  };


  /*
  	 * @method
   */

  RangeFacet.prototype.updateDash = function() {
    return this.$('.dash').css('left', this.model.get('handleMinLeft') + ((this.model.get('handleMaxLeft') - this.model.get('handleMinLeft')) / 2) + 3);
  };


  /*
  	 * @method
  	 * @override FacetView::update
  	 * @param {Object} newOptions
   */

  RangeFacet.prototype.update = function(newOptions) {
    var ll, ul;
    if (_.isArray(newOptions)) {
      if (newOptions[0] != null) {
        newOptions = newOptions[0];
        if (newOptions.lowerLimit < 2500) {
          ll = newOptions.lowerLimit;
          ul = newOptions.upperLimit;
        } else {
          ll = this.model.convertLimit2Year(newOptions.lowerLimit);
          ul = this.model.convertLimit2Year(newOptions.upperLimit);
        }
        this.model.set({
          currentMin: ll,
          currentMax: ul
        });
      }
    } else {
      this.model.reset();
    }
    if (this.button != null) {
      return this.button.style.display = 'none';
    }
  };

  return RangeFacet;

})(FacetView);

module.exports = RangeFacet;



},{"../main":30,"./body.jade":31,"./model":33}],33:[function(_dereq_,module,exports){
var FacetModel, Range, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = _dereq_('underscore');

FacetModel = _dereq_('../../../models/facets/main');


/*
 * @class
 * @namespace Models
 */

Range = (function(_super) {
  __extends(Range, _super);

  function Range() {
    this.dragMax = __bind(this.dragMax, this);
    this.dragMin = __bind(this.dragMin, this);
    return Range.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @method
  	 * @override FacetModel::defaults
  	 * @return {Obect} Hash of default attributes.
   */

  Range.prototype.defaults = function() {
    return _.extend({}, Range.__super__.defaults.apply(this, arguments), {
      min: null,
      max: null,
      currentMin: null,
      currentMax: null,
      handleMinLeft: null,
      handleMaxLeft: null,
      sliderWidth: null
    });
  };


  /*
  	 * @method
  	 * @override FacetModel::initialize
  	 * @construct
   */

  Range.prototype.initialize = function() {
    return this.once('change', (function(_this) {
      return function() {
        _this.on('change:currentMin', function(model, value) {
          return _this.set({
            handleMinLeft: _this.getLeftFromYear(value)
          });
        });
        _this.on('change:currentMax', function(model, value) {
          return _this.set({
            handleMaxLeft: _this.getLeftFromYear(value)
          });
        });
        _this.on('change:handleMinLeft', function(model, value) {
          return _this.set({
            currentMin: _this.getYearFromLeft(value)
          });
        });
        return _this.on('change:handleMaxLeft', function(model, value) {
          return _this.set({
            currentMax: _this.getYearFromLeft(value)
          });
        });
      };
    })(this));
  };


  /*
  	 * @method
  	 * @override FacetModel::set
   */

  Range.prototype.set = function(attrs, options) {
    if (attrs.hasOwnProperty('currentMin')) {
      if (attrs.currentMin > this.get('currentMax')) {
        attrs.currentMax = +attrs.currentMin;
        attrs.currentMin = this.get('currentMax');
      }
    }
    if (attrs.hasOwnProperty('currentMax')) {
      if (attrs.currentMax < this.get('currentMin')) {
        attrs.currentMin = +attrs.currentMax;
        attrs.currentMax = this.get('currentMin');
      }
    }
    if (attrs.hasOwnProperty('currentMin') && this.has('min') && attrs.currentMin < this.get('min')) {
      attrs.currentMin = this.get('min');
    }
    if (attrs.hasOwnProperty('currentMax') && this.has('max') && attrs.currentMax > this.get('max')) {
      attrs.currentMax = this.get('max');
    }
    return Range.__super__.set.apply(this, arguments);
  };


  /*
  	 * @method
  	 * @override FacetModel::parse
  	 * @param {Object} attrs Attributes returned by the server.
  	 * @return {Object} The parsed attributes.
   */

  Range.prototype.parse = function(attrs) {
    Range.__super__.parse.apply(this, arguments);
    attrs.min = attrs.currentMin = this.convertLimit2Year(attrs.options[0].lowerLimit);
    attrs.max = attrs.currentMax = this.convertLimit2Year(attrs.options[0].upperLimit);
    delete attrs.options;
    return attrs;
  };


  /*
  	 * Convert the lower and upper limit string to a year.
  	 *
  	 * @method
  	 * @param {Number} limit - Lower or upper limit, for example: 20141213
  	 * @return {Number} A year, for example: 2014
  	 * @example "20141213" returns 2014; "8000101" returns 800.
   */

  Range.prototype.convertLimit2Year = function(limit) {
    var year;
    year = limit + '';
    if (year.length === 8) {
      year = year.substr(0, 4);
    } else if (year.length === 7) {
      year = year.substr(0, 3);
    } else {
      throw new Error("Range: lower or upper limit is not 7 or 8 chars!");
    }
    return +year;
  };


  /*
  	 * Convert a year to a lower or upper limit string
  	 *
  	 * @method
  	 * @private
  	 * @param {Number} year - A year
  	 * @param {Boolean} from - If from is true, the limit start at januari 1st, else it ends at december 31st
  	 * @return {Number} A limit, for example: 20140101
  	 * @example 2014 returns "20141231"; 800 returns "8000101".
   */

  Range.prototype._convertYear2Limit = function(year, from) {
    var limit;
    if (from == null) {
      from = true;
    }
    limit = year + '';
    limit += from ? "0101" : "1231";
    return +limit;
  };

  Range.prototype.getLowerLimit = function() {
    return this._convertYear2Limit(this.get('currentMin'));
  };

  Range.prototype.getUpperLimit = function() {
    return this._convertYear2Limit(this.get('currentMax'), false);
  };

  Range.prototype.reset = function() {
    return this.set({
      currentMin: this.get('min'),
      currentMax: this.get('max'),
      lowerLimit: this.get('min'),
      upperLimit: this.get('max')
    });
  };

  Range.prototype.getLeftFromYear = function(year) {
    var hhw, ll, sw, ul;
    ll = this.get('min');
    ul = this.get('max');
    sw = this.get('sliderWidth');
    hhw = this.get('handleWidth') / 2;
    return (((year - ll) / (ul - ll)) * sw) - hhw;
  };

  Range.prototype.getYearFromLeft = function(left) {
    var hhw, ll, sw, ul;
    ll = this.get('min');
    ul = this.get('max');
    hhw = this.get('handleWidth') / 2;
    sw = this.get('sliderWidth');
    return Math.round((((left + hhw) / sw) * (ul - ll)) + ll);
  };

  Range.prototype.dragMin = function(pos) {
    var handelWidthHalf;
    handelWidthHalf = this.get('handleWidth') / 2;
    if (((-handelWidthHalf) <= pos && pos <= this.get('handleMaxLeft'))) {
      return this.set({
        handleMinLeft: pos
      });
    }
  };

  Range.prototype.dragMax = function(pos) {
    if ((this.get('handleMinLeft') < pos && pos <= this.get('sliderWidth') - (this.get('handleWidth') / 2))) {
      return this.set({
        handleMaxLeft: pos
      });
    }
  };

  return Range;

})(FacetModel);

module.exports = Range;



},{"../../../models/facets/main":16}],34:[function(_dereq_,module,exports){
var $, Backbone, HibbPagination, Result, Results, SortLevels, listItems, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Result = _dereq_('./result');

SortLevels = _dereq_('./sort');

HibbPagination = _dereq_('hibb-pagination');

tpl = _dereq_('./index.jade');

listItems = [];


/*
 * Contains a header and a body. In the header the number of results, sorting and
 * pagination is rendered. In the body a list of results.
 *
 * @class
 * @namespace Views
 * @uses Result
 * @uses SortLevels
 * @uses HibbPagination
 * @uses Config
 * @uses SearchResults
 */

Results = (function(_super) {
  __extends(Results, _super);

  function Results() {
    return Results.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {Boolean}
   */

  Results.prototype.isMetadataVisible = true;


  /*
  	 * Keep track of instanciated result item views.
  	 *
  	 * Should be redefined during initialization to prevent sharing between instances.
  	 *
  	 * @property
  	 * @type {Array<Result>}
   */

  Results.prototype.resultItems = null;


  /*
  	 * Hash to keep track of instanciated subviews.
  	 *
  	 * Should be redefined during initialization to prevent sharing between instances.
  	 *
  	 * @property
  	 * @type {Object}
   */

  Results.prototype.subviews = null;


  /*
  	 * @method
  	 * @constructs
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
  	 * @param {SearchResults} this.options.searchResults
   */

  Results.prototype.initialize = function(options) {
    this.options = options;
    this.subviews = {};
    this.resultItems = [];
    this.listenTo(this.options.searchResults, 'change:page', this._renderResultsPage);
    this.listenTo(this.options.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        _this.$('header h3.numfound').html("" + (_this.options.config.get('labels').numFound) + " " + (responseModel.get('numFound')) + " " + (_this.options.config.get('termPlural')));
        _this.renderPagination(responseModel);
        return _this._renderResultsPage(responseModel);
      };
    })(this));
    return this.render();
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {Results}
   */

  Results.prototype.render = function() {
    this.$el.html(tpl({
      showMetadata: this.options.config.get('showMetadata'),
      resultsPerPage: this.options.config.get('resultRows'),
      config: this.options.config
    }));
    this._renderSorting();
    $(window).resize((function(_this) {
      return function() {
        var pages;
        pages = _this.$('div.pages');
        return pages.height($(window).height() - pages.offset().top);
      };
    })(this));
    return this;
  };


  /*
  	 * @method
  	 * @private
   */

  Results.prototype._renderSorting = function() {
    if (!this.options.config.get('sortLevels')) {
      return;
    }
    if (this.subviews.sortLevels != null) {
      this.subviews.sortLevels.destroy();
    }
    this.subviews.sortLevels = new Views.SortLevels({
      config: this.options.config
    });
    this.$('header nav ul').prepend(this.subviews.sortLevels.$el);
    return this.listenTo(this.subviews.sortLevels, 'change', (function(_this) {
      return function(sortParameters) {
        return _this.trigger('change:sort-levels', sortParameters);
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
  	 * @param {Object} responseModel The model returned by the server.
   */

  Results.prototype._renderResultsPage = function(responseModel) {
    var frag, fulltext, pageNumber, result, ul, _i, _len, _ref;
    this._destroyResultItems();
    this.$("div.pages").html('');
    fulltext = false;
    if (responseModel.get('results').length > 0 && (responseModel.get('results')[0].terms != null)) {
      if (Object.keys(responseModel.get('results')[0].terms).length > 0) {
        fulltext = true;
      }
    }
    frag = document.createDocumentFragment();
    _ref = responseModel.get('results');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      result = _ref[_i];
      result = new Result({
        data: result,
        fulltext: fulltext,
        config: this.options.config
      });
      this.resultItems.push(result);
      this.listenTo(result, 'click', function(resultData) {
        return this.trigger('result:click', resultData);
      });
      this.listenTo(result, 'layer:click', function(layer, resultData) {
        return this.trigger('result:layer-click', layer, resultData);
      });
      frag.appendChild(result.el);
    }
    pageNumber = this.subviews.pagination.getCurrentPageNumber();
    ul = $("<ul class=\"page\" data-page-number=\"" + pageNumber + "\" />");
    ul.html(frag);
    return this.$("div.pages").append(ul);
  };


  /*
  	 * @method
   */

  Results.prototype.renderPagination = function(responseModel) {
    if (this.subviews.pagination != null) {
      this.stopListening(this.subviews.pagination);
      this.subviews.pagination.destroy();
    }
    this.subviews.pagination = new HibbPagination({
      resultsStart: responseModel.get('start'),
      resultsPerPage: this.options.config.get('resultRows'),
      resultsTotal: responseModel.get('numFound')
    });
    this.listenTo(this.subviews.pagination, 'change:pagenumber', this.changePage);
    return this.$('header .pagination').html(this.subviews.pagination.el);
  };


  /*
  	 * @method
  	 * @param {Number} pageNumber
   */

  Results.prototype.changePage = function(pageNumber) {
    var page, pages;
    pages = this.$('div.pages');
    pages.find('ul.page').hide();
    page = pages.find("ul.page[data-page-number=\"" + pageNumber + "\"]");
    if (page.length > 0) {
      return page.show();
    } else {
      return this.options.searchResults.page(pageNumber);
    }
  };


  /*
  	 * @method
  	 * @return {Object}
   */

  Results.prototype.events = function() {
    return {
      'change li.show-metadata input': 'showMetadata',
      'change li.results-per-page select': 'onChangeResultsPerPage'
    };
  };


  /*
  	 * @method
   */

  Results.prototype.onChangeResultsPerPage = function(ev) {
    var t;
    t = ev.currentTarget;
    return this.options.config.set('resultRows', t.options[t.selectedIndex].value);
  };


  /*
  	 * @method
   */

  Results.prototype.showMetadata = function(ev) {
    this.isMetadataVisible = ev.currentTarget.checked;
    return this.$('.metadata').toggle(this.isMetadataVisible);
  };


  /*
  	 * @method
   */

  Results.prototype.reset = function() {
    return this._renderSorting();
  };


  /*
  	 * @method
   */

  Results.prototype.destroy = function() {
    this._destroyResultItems();
    return this.subviews.sortLevels.destroy();
  };


  /*
  	 * @method
  	 * @private
   */

  Results.prototype._destroyResultItems = function() {
    var item, _i, _len, _ref, _results;
    _ref = this.resultItems;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(item.destroy());
    }
    return _results;
  };

  return Results;

})(Backbone.View);

module.exports = Results;



},{"./index.jade":35,"./result":36,"./sort":38,"hibb-pagination":10}],35:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config, resultsPerPage, showMetadata, undefined) {
buf.push("<header><h3 class=\"numfound\"></h3><nav><ul><li class=\"results-per-page\"><select name=\"results-per-page\">");
// iterate [10, 25, 50, 100, 250, 500, 1000]
;(function(){
  var $$obj = [10, 25, 50, 100, 250, 500, 1000];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var count = $$obj[$index];

buf.push("<option" + (jade.attr("value", count, true, false)) + (jade.attr("selected", count===resultsPerPage, true, false)) + ">" + (jade.escape(null == (jade_interp = count + " " + config.get('termPlural')) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var count = $$obj[$index];

buf.push("<option" + (jade.attr("value", count, true, false)) + (jade.attr("selected", count===resultsPerPage, true, false)) + ">" + (jade.escape(null == (jade_interp = count + " " + config.get('termPlural')) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></li>");
if ( showMetadata)
{
buf.push("<li class=\"show-metadata\"><input id=\"o45hes3\" type=\"checkbox\" checked=\"checked\"/><label for=\"o45hes3\">Show metadata</label></li>");
}
buf.push("</ul></nav><div class=\"pagination\"></div></header><div class=\"pages\"></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"resultsPerPage" in locals_for_with?locals_for_with.resultsPerPage:typeof resultsPerPage!=="undefined"?resultsPerPage:undefined,"showMetadata" in locals_for_with?locals_for_with.showMetadata:typeof showMetadata!=="undefined"?showMetadata:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":11}],36:[function(_dereq_,module,exports){
var Backbone, Result, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

tpl = _dereq_('./result.jade');


/*
 * The view of one result item < li >.
 *
 * @class Result
 * @namespace Views
 * @todo Rename to ResultItem
 */

Result = (function(_super) {
  __extends(Result, _super);

  function Result() {
    return Result.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  Result.prototype.className = 'result';


  /*
  	 * @property
  	 * @type {String}
   */

  Result.prototype.tagName = 'li';


  /*
  	 * @method
  	 * @construct
  	 * @param {Object} this.options
  	 * @param {Object} this.options.data The data of the result.
  	 * @param {Boolean} [this.options.fulltext=false] Is the result coming from a full text search?
   */

  Result.prototype.initialize = function(options) {
    var _base;
    this.options = options;
    if ((_base = this.options).fulltext == null) {
      _base.fulltext = false;
    }
    if (this.options.fulltext) {
      this.$el.addClass('fulltext');
    } else {
      this.$el.addClass('no-fulltext');
    }
    return this.render();
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {Result}
   */

  Result.prototype.render = function() {
    var count, found, rtpl, term, _ref;
    found = [];
    _ref = this.options.data.terms;
    for (term in _ref) {
      if (!__hasProp.call(_ref, term)) continue;
      count = _ref[term];
      found.push("" + count + "x " + term);
    }
    if (this.options.config.get('templates').hasOwnProperty('result')) {
      tpl = this.options.config.get('templates').result;
    }
    rtpl = tpl({
      data: this.options.data,
      fulltext: this.options.fulltext,
      found: found.join(', ')
    });
    this.$el.html(rtpl);
    return this;
  };


  /*
  	 * @method
   */

  Result.prototype.events = function() {
    return {
      'click': '_handleClick',
      'click li[data-layer]': '_handleLayerClick'
    };
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  Result.prototype._handleClick = function(ev) {
    return this.trigger('click', this.options.data);
  };


  /*
  	 * @method
  	 * @private
  	 * @return {Object} ev The event object.
   */

  Result.prototype._handleLayerClick = function(ev) {
    var layer;
    ev.stopPropagation();
    layer = ev.currentTarget.getAttribute('data-layer');
    return this.trigger('layer:click', layer, this.options.data);
  };


  /*
  	 * @method
   */

  Result.prototype.destroy = function() {
    return this.remove();
  };

  return Result;

})(Backbone.View);

module.exports = Result;


/* TEMPLATE FOR CUSTOM RESULT

class Result extends Backbone.View

	className: 'result'

	tagName: 'li'

	initialize: (@options={}) ->
		@options.fulltext ?= false
		if @options.fulltext then @$el.addClass 'fulltext' else @$el.addClass 'no-fulltext'

		@render()

	render: ->
		found = []
		found.push "#{count}x #{term}" for own term, count of @options.data.terms

		data = _.extend @options,
			data: @options.data
			found: found.join(', ')

		rtpl = tpl data
		@$el.html rtpl

		@

	events: ->
		'click': '_handleClick'

	_handleClick: (ev) ->
		@trigger 'click', @options.data

	destroy: ->
		@remove()

/TEMPLATE
 */



},{"./result.jade":37}],37:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data, found, fulltext, undefined) {
data.metadata = typeof data.metadata !== 'undefined' ? data.metadata : [];
buf.push("<div class=\"title\">" + (jade.escape(null == (jade_interp = data.name) ? "" : jade_interp)) + "</div><div class=\"metadata\"><ul>");
// iterate data.metadata
;(function(){
  var $$obj = data.metadata;
  if ('number' == typeof $$obj.length) {

    for (var key = 0, $$l = $$obj.length; key < $$l; key++) {
      var value = $$obj[key];

buf.push("<li><span class=\"key\">" + (jade.escape(null == (jade_interp = key+': ') ? "" : jade_interp)) + "</span><span class=\"value\">" + (jade.escape(null == (jade_interp = value) ? "" : jade_interp)) + "</span></li>");
    }

  } else {
    var $$l = 0;
    for (var key in $$obj) {
      $$l++;      var value = $$obj[key];

buf.push("<li><span class=\"key\">" + (jade.escape(null == (jade_interp = key+': ') ? "" : jade_interp)) + "</span><span class=\"value\">" + (jade.escape(null == (jade_interp = value) ? "" : jade_interp)) + "</span></li>");
    }

  }
}).call(this);

buf.push("</ul></div>");
if ( fulltext)
{
buf.push("<div class=\"found\">" + (jade.escape(null == (jade_interp = found) ? "" : jade_interp)) + "</div><div class=\"keywords\"><ul>");
if ( data._kwic != null)
{
// iterate data._kwic
;(function(){
  var $$obj = data._kwic;
  if ('number' == typeof $$obj.length) {

    for (var layer = 0, $$l = $$obj.length; layer < $$l; layer++) {
      var kwic = $$obj[layer];

buf.push("<li" + (jade.attr("data-layer", layer, true, false)) + "><label>" + (jade.escape(null == (jade_interp = layer) ? "" : jade_interp)) + "</label><ul class=\"kwic\">");
// iterate kwic
;(function(){
  var $$obj = kwic;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row) ? "" : jade_interp) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row) ? "" : jade_interp) + "</li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
    }

  } else {
    var $$l = 0;
    for (var layer in $$obj) {
      $$l++;      var kwic = $$obj[layer];

buf.push("<li" + (jade.attr("data-layer", layer, true, false)) + "><label>" + (jade.escape(null == (jade_interp = layer) ? "" : jade_interp)) + "</label><ul class=\"kwic\">");
// iterate kwic
;(function(){
  var $$obj = kwic;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row) ? "" : jade_interp) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row) ? "" : jade_interp) + "</li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
    }

  }
}).call(this);

}
buf.push("</ul></div>");
}}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"found" in locals_for_with?locals_for_with.found:typeof found!=="undefined"?found:undefined,"fulltext" in locals_for_with?locals_for_with.fulltext:typeof fulltext!=="undefined"?fulltext:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":11}],38:[function(_dereq_,module,exports){
var $, Backbone, SortLevels, el, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

el = _dereq_('funcky.el').el;

tpl = _dereq_('./sort.jade');


/*
 * Input element to set the sorting levels. There are three levels and every
 * level can be set ascending or descending.
 * 
 * @class
 * @namespace Views
 * @uses Config
 */

SortLevels = (function(_super) {
  __extends(SortLevels, _super);

  function SortLevels() {
    return SortLevels.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  SortLevels.prototype.tagName = 'li';


  /*
  	 * @property
  	 * @type {String}
   */

  SortLevels.prototype.className = 'sort-levels';


  /*
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
   */

  SortLevels.prototype.initialize = function(options) {
    this.options = options;
    this.render();
    this.listenTo(this.options.config, 'change:entryMetadataFields', this.render);
    return this.listenTo(this.options.config, 'change:levels', (function(_this) {
      return function(model, sortLevels) {
        var level, sortParameters, _i, _len;
        sortParameters = [];
        for (_i = 0, _len = sortLevels.length; _i < _len; _i++) {
          level = sortLevels[_i];
          sortParameters.push({
            fieldname: level,
            direction: 'asc'
          });
        }
        _this.trigger('change', sortParameters);
        return _this.render();
      };
    })(this));
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {SortLevels}
   */

  SortLevels.prototype.render = function() {
    var leave, levels, rtpl;
    rtpl = tpl({
      levels: this.options.config.get('levels'),
      entryMetadataFields: this.options.config.get('entryMetadataFields')
    });
    this.$el.html(rtpl);
    levels = this.$('div.levels');
    leave = function(ev) {
      if (!(el(levels[0]).hasDescendant(ev.target) || levels[0] === ev.target)) {
        return levels.hide();
      }
    };
    this.onMouseleave = leave.bind(this);
    levels.on('mouseleave', this.onMouseleave);
    return this;
  };


  /*
  	 * @method
  	 * @return {Object}
   */

  SortLevels.prototype.events = function() {
    return {
      'click button.toggle': 'toggleLevels',
      'click li.search button': 'saveLevels',
      'change div.levels select': 'changeLevels',
      'click div.levels i.fa': 'changeAlphaSort'
    };
  };


  /*
  	 * @method
   */

  SortLevels.prototype.toggleLevels = function(ev) {
    return this.$('div.levels').toggle();
  };


  /*
  	 * @method
   */

  SortLevels.prototype.hideLevels = function() {
    return this.$('div.levels').hide();
  };


  /*
  	 * @method
   */

  SortLevels.prototype.changeLevels = function(ev) {
    var $target, i, select, target, _i, _j, _len, _len1, _ref, _ref1, _results;
    this.$('div.levels').addClass('show-save-button');
    target = ev.currentTarget;
    _ref = this.el.querySelectorAll('div.levels select');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      select = _ref[_i];
      if (select.name !== target.name && select.value === target.value) {
        select.selectedIndex = 0;
      }
    }
    _ref1 = this.el.querySelectorAll('div.levels i.fa');
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      i = _ref1[_j];
      $target = this.$(i);
      $target.addClass('fa-sort-alpha-asc');
      _results.push($target.removeClass('fa-sort-alpha-desc'));
    }
    return _results;
  };


  /*
  	 * @method
   */

  SortLevels.prototype.changeAlphaSort = function(ev) {
    var $target;
    this.$('div.levels').addClass('show-save-button');
    $target = this.$(ev.currentTarget);
    $target.toggleClass('fa-sort-alpha-asc');
    return $target.toggleClass('fa-sort-alpha-desc');
  };


  /*
  	 * @method
   */

  SortLevels.prototype.saveLevels = function() {
    var li, select, sortParameter, sortParameters, _i, _len, _ref;
    sortParameters = [];
    _ref = this.el.querySelectorAll('div.levels li[name]');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      li = _ref[_i];
      select = li.querySelector('select');
      sortParameter = {};
      sortParameter.fieldname = select.options[select.selectedIndex].value;
      sortParameter.direction = $(li).find('i.fa').hasClass('fa-sort-alpha-asc') ? 'asc' : 'desc';
      sortParameters.push(sortParameter);
    }
    this.hideLevels();
    return this.trigger('change', sortParameters);
  };


  /*
  	 * @method
   */

  SortLevels.prototype.destroy = function() {
    this.$('div.levels').off('mouseleave', this.onMouseleave);
    return this.remove();
  };

  return SortLevels;

})(Backbone.View);

module.exports = SortLevels;



},{"./sort.jade":39,"funcky.el":7}],39:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (entryMetadataFields, levels, undefined) {
buf.push("<button class=\"toggle\">Sort<i class=\"fa fa-caret-down\"></i></button><div class=\"levels\"><ul>");
// iterate [1, 2, 3]
;(function(){
  var $$obj = [1, 2, 3];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var i = $$obj[$index];

buf.push("<li" + (jade.attr("name", 'level'+i, true, false)) + "><label>" + (jade.escape(null == (jade_interp = 'Level '+i) ? "" : jade_interp)) + "</label><select" + (jade.attr("name", 'level'+i, true, false)) + "><option></option>");
// iterate entryMetadataFields
;(function(){
  var $$obj = entryMetadataFields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var field = $$obj[$index];

buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", field==levels[i-1], true, false)) + ">" + (jade.escape(null == (jade_interp = field) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var field = $$obj[$index];

buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", field==levels[i-1], true, false)) + ">" + (jade.escape(null == (jade_interp = field) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><i class=\"fa fa-sort-alpha-asc\"></i></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var i = $$obj[$index];

buf.push("<li" + (jade.attr("name", 'level'+i, true, false)) + "><label>" + (jade.escape(null == (jade_interp = 'Level '+i) ? "" : jade_interp)) + "</label><select" + (jade.attr("name", 'level'+i, true, false)) + "><option></option>");
// iterate entryMetadataFields
;(function(){
  var $$obj = entryMetadataFields;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var field = $$obj[$index];

buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", field==levels[i-1], true, false)) + ">" + (jade.escape(null == (jade_interp = field) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var field = $$obj[$index];

buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", field==levels[i-1], true, false)) + ">" + (jade.escape(null == (jade_interp = field) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><i class=\"fa fa-sort-alpha-asc\"></i></li>");
    }

  }
}).call(this);

buf.push("<li class=\"search\">&nbsp;<button>Change levels</button></li></ul></div>");}.call(this,"entryMetadataFields" in locals_for_with?locals_for_with.entryMetadataFields:typeof entryMetadataFields!=="undefined"?entryMetadataFields:undefined,"levels" in locals_for_with?locals_for_with.levels:typeof levels!=="undefined"?levels:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":11}],40:[function(_dereq_,module,exports){
var Backbone, SearchModel, TextSearch, funcky, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

SearchModel = _dereq_('../models/search');

tpl = _dereq_('../../jade/text-search.jade');

funcky = _dereq_('funcky.util');


/*
 * @class
 * @namespace Views
 * @uses Config
 * @uses SearchModel
 */

TextSearch = (function(_super) {
  __extends(TextSearch, _super);

  function TextSearch() {
    return TextSearch.__super__.constructor.apply(this, arguments);
  }

  TextSearch.prototype.className = 'text-search';


  /*
  	 * @method
  	 * @construct
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
   */

  TextSearch.prototype.initialize = function(options) {
    this.options = options;
    return this.setModel();
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {TextSearch}
   */

  TextSearch.prototype.render = function() {
    if (this.options.config.get('templates').hasOwnProperty('text-search')) {
      tpl = this.options.config.get('templates')['text-search'];
    }
    this.$el.html(tpl({
      model: this.model,
      config: this.options.config,
      generateId: funcky.generateID
    }));
    return this;
  };


  /*
  	 * @method
  	 * @return {Object}
   */

  TextSearch.prototype.events = function() {
    return {
      'click i.fa-search': 'search',
      'keyup input[name="search"]': 'onKeyUp',
      'focus input[name="search"]': function() {
        return this.$('.body .menu').slideDown(150);
      },
      'click .menu .fa-times': function() {
        return this.$('.body .menu').slideUp(150);
      },
      'change input[type="checkbox"]': 'checkboxChanged',
      'change input[type="radio"]': 'checkboxChanged'
    };
  };


  /*
  	 * @method
  	 * @private
   */

  TextSearch.prototype._addFullTextSearchParameters = function() {
    var ftsp, param, params, _i, _len;
    ftsp = this.options.config.get('textSearchOptions').fullTextSearchParameters;
    if (ftsp != null) {
      params = [];
      for (_i = 0, _len = ftsp.length; _i < _len; _i++) {
        param = ftsp[_i];
        params.push({
          name: param,
          term: "*"
        });
      }
      return this.model.set({
        fullTextSearchParameters: params
      });
    }
  };


  /*
  	 * @method
   */

  TextSearch.prototype.setModel = function() {
    var attrs, textSearchOptions;
    if (this.model != null) {
      this.stopListening(this.model);
    }
    textSearchOptions = this.options.config.get('textSearchOptions');
    attrs = _.clone(textSearchOptions);
    if (textSearchOptions.caseSensitive) {
      attrs.caseSensitive = false;
    } else {
      delete attrs.caseSensitive;
    }
    if (textSearchOptions.fuzzy) {
      attrs.fuzzy = false;
    } else {
      delete attrs.fuzzy;
    }
    this.model = new SearchModel(attrs);
    this._addFullTextSearchParameters();
    return this.listenTo(this.options.config, "change:textSearchOptions", (function(_this) {
      return function() {
        _this._addFullTextSearchParameters();
        return _this.render();
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  TextSearch.prototype.onKeyUp = function(ev) {
    var cb, _i, _len, _ref;
    if (ev.keyCode === 13) {
      ev.preventDefault();
      return this.search(ev);
    }
    if (this.model.has('term')) {
      if (this.model.get('term') !== ev.currentTarget.value) {
        this.model.set({
          term: ev.currentTarget.value
        });
      }
    } else {
      _ref = this.el.querySelectorAll('[data-attr-array="fullTextSearchParameters"]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        if (cb.checked) {
          this.model.set({
            fullTextSearchParameters: [
              {
                name: cb.getAttribute('data-value'),
                term: ev.currentTarget.value
              }
            ]
          });
        }
      }
    }
    return this.updateQueryModel();
  };


  /*
  	 * @method
  	 * @param {Object} ev The event object.
   */

  TextSearch.prototype.checkboxChanged = function(ev) {
    var attr, cb, checkedArray, dataAttr, dataAttrArray, _i, _j, _len, _len1, _ref, _ref1;
    dataAttr = ev.currentTarget.getAttribute('data-attr');
    dataAttrArray = ev.currentTarget.getAttribute('data-attr-array');
    if (attr = dataAttr) {
      if (attr === 'searchInTranscriptions') {
        this.$('ul.textlayers').toggle(ev.currentTarget.checked);
      }
      this.model.set(attr, ev.currentTarget.checked);
    } else if (dataAttrArray === 'fullTextSearchParameters') {
      checkedArray = [];
      _ref = this.el.querySelectorAll('[data-attr-array="fullTextSearchParameters"]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        if (cb.checked) {
          checkedArray.push({
            name: cb.getAttribute('data-value'),
            term: this.$('input[name="search"]').val()
          });
        }
      }
      this.model.set(dataAttrArray, checkedArray);
    } else if (dataAttrArray != null) {
      checkedArray = [];
      _ref1 = this.el.querySelectorAll("[data-attr-array=\"" + dataAttrArray + "\"]");
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        cb = _ref1[_j];
        if (cb.checked) {
          checkedArray.push(cb.getAttribute('data-value'));
        }
      }
      this.model.set(dataAttrArray, checkedArray);
    }
    return this.updateQueryModel();
  };


  /*
  	 * @method
   */

  TextSearch.prototype.search = function(ev) {
    ev.preventDefault();
    return this.trigger('search');
  };


  /*
  	 * @method
   */

  TextSearch.prototype.updateQueryModel = function() {
    return this.trigger('change', this.model.attributes);
  };


  /*
  	 * @method
   */

  TextSearch.prototype.reset = function() {
    this.setModel();
    return this.render();
  };


  /*
  	 * @method
   */

  TextSearch.prototype.destroy = function() {
    return this.remove();
  };

  return TextSearch;

})(Backbone.View);

module.exports = TextSearch;



},{"../../jade/text-search.jade":44,"../models/search":18,"funcky.util":9}],41:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (options, ucfirst, undefined) {
buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade_interp = ucfirst(option.name)) ? "" : jade_interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade_interp = option.count) ? "" : jade_interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade_interp = ucfirst(option.name)) ? "" : jade_interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade_interp = option.count) ? "" : jade_interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");}.call(this,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"ucfirst" in locals_for_with?locals_for_with.ucfirst:typeof ucfirst!=="undefined"?ucfirst:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":11}],42:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config, model, options) {
options = model.get('options')
buf.push("<div class=\"placeholder\"><header><h3" + (jade.attr("title", model.get('title'), true, false)) + ">" + (jade.escape(null == (jade_interp = model.get('title')) ? "" : jade_interp)) + "</h3><div class=\"menu\">");
if ( options != null && options.length != null && options.length > 9)
{
buf.push("<i" + (jade.attr("title", config.get('labels').filterOptions, true, false)) + " class=\"filter fa fa-filter\"></i><i" + (jade.attr("title", config.get('labels').sortAlphabetically, true, false)) + " class=\"alpha fa fa-sort-alpha-asc\"></i><i" + (jade.attr("title", config.get('labels').sortNumerically, true, false)) + " class=\"amount active fa fa-sort-amount-desc\"></i>");
}
buf.push("</div><div class=\"options\"></div></header><div class=\"body\"></div></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"model" in locals_for_with?locals_for_with.model:typeof model!=="undefined"?model:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined));;return buf.join("");
};
},{"jade/runtime":11}],43:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"overlay\"><div><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div><div class=\"faceted-search\"><div class=\"text-search-placeholder\"></div><ul class=\"facets-menu\"><li class=\"reset\"><button><i class=\"fa fa-refresh\"></i><span>New search</span></button></li><li class=\"switch\"><button><i class=\"fa fa-angle-double-up\"></i><i class=\"fa fa-angle-double-down\"></i><span class=\"simple\">Simple search</span><span class=\"advanced\">Advanced search</span></button></li><li class=\"collapse-expand\"><button><i class=\"fa fa-compress\"></i><span>Collapse filters</span></button></li></ul><div class=\"facets-placeholder\"></div></div><div class=\"results\"></div>");;return buf.join("");
};
},{"jade/runtime":11}],44:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config, generateId, id, model, undefined) {
buf.push("<div class=\"placeholder\"><div class=\"body\"><div class=\"search-input\"><input type=\"text\" name=\"search\"/><i class=\"fa fa-search\"></i></div><div class=\"menu\"><i class=\"fa fa-times\"></i><div class=\"close\"></div><ul class=\"options\">");
if ( config.get('textSearchOptions').caseSensitive)
{
id = generateId()
buf.push("<li class=\"option case-sensitive\"><input" + (jade.attr("id", id, true, false)) + " type=\"checkbox\" data-attr=\"caseSensitive\"/><label" + (jade.attr("for", id, true, false)) + ">Match case</label></li>");
}
if ( config.get('textSearchOptions').fuzzy)
{
id = generateId()
buf.push("<li class=\"option fuzzy\"><input" + (jade.attr("id", id, true, false)) + " type=\"checkbox\" data-attr=\"fuzzy\"/><label" + (jade.attr("for", id, true, false)) + ">Fuzzy</label></li>");
}
if ( model.has('searchInAnnotations') || model.has('searchInTranscriptions'))
{
buf.push("<li class=\"option search-annotations\"><h4>Search in:</h4><ul class=\"searchins\">");
if ( model.has('searchInTranscriptions'))
{
id = generateId()
buf.push("<li class=\"searchin\"><input" + (jade.attr("id", id, true, false)) + " type=\"checkbox\" data-attr=\"searchInTranscriptions\"" + (jade.attr("checked", model.get('searchInTranscriptions'), true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">Transcriptions</label></li>");
}
if ( model.has('searchInAnnotations'))
{
id = generateId()
buf.push("<li class=\"searchin\"><input" + (jade.attr("id", id, true, false)) + " type=\"checkbox\" data-attr=\"searchInAnnotations\"" + (jade.attr("checked", model.get('searchInAnnotations'), true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">Annotations</label></li>");
}
buf.push("</ul></li>");
}
if ( model.has('textLayers') && model.get('textLayers').length > 1)
{
buf.push("<li class=\"option search-textlayers\"><h4>Textlayers:</h4><ul class=\"textlayers\">");
// iterate model.get('textLayers')
;(function(){
  var $$obj = model.get('textLayers');
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attr("id", 'cb_textlayer'+textLayer, true, false)) + " type=\"checkbox\" data-attr-array=\"textLayers\"" + (jade.attr("data-value", textLayer, true, false)) + " checked=\"checked\"/><label" + (jade.attr("for", 'cb_textlayer'+textLayer, true, false)) + ">" + (jade.escape(null == (jade_interp = textLayer) ? "" : jade_interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attr("id", 'cb_textlayer'+textLayer, true, false)) + " type=\"checkbox\" data-attr-array=\"textLayers\"" + (jade.attr("data-value", textLayer, true, false)) + " checked=\"checked\"/><label" + (jade.attr("for", 'cb_textlayer'+textLayer, true, false)) + ">" + (jade.escape(null == (jade_interp = textLayer) ? "" : jade_interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
}
var fields = config.get('textSearchOptions').fullTextSearchParameters;
if ( fields != null && fields.length > 1)
{
buf.push("<li class=\"option fields\"><h4>" + (jade.escape(null == (jade_interp = config.get('labels').fullTextSearchParameters) ? "" : jade_interp)) + "</h4><ul class=\"fields\">");
// iterate fields
;(function(){
  var $$obj = fields;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var field = $$obj[i];

id = generateId()
buf.push("<li><input type=\"radio\"" + (jade.attr("checked", i==0?true:false, true, false)) + " name=\"textsearchoptions\"" + (jade.attr("id", id, true, false)) + " data-attr-array=\"fullTextSearchParameters\"" + (jade.attr("data-value", field, true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">" + (jade.escape(null == (jade_interp = config.get('facetTitleMap')[field]) ? "" : jade_interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var field = $$obj[i];

id = generateId()
buf.push("<li><input type=\"radio\"" + (jade.attr("checked", i==0?true:false, true, false)) + " name=\"textsearchoptions\"" + (jade.attr("id", id, true, false)) + " data-attr-array=\"fullTextSearchParameters\"" + (jade.attr("data-value", field, true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">" + (jade.escape(null == (jade_interp = config.get('facetTitleMap')[field]) ? "" : jade_interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
}
buf.push("</ul></div></div></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"generateId" in locals_for_with?locals_for_with.generateId:typeof generateId!=="undefined"?generateId:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"model" in locals_for_with?locals_for_with.model:typeof model!=="undefined"?model:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":11}]},{},[14])
(14)
});