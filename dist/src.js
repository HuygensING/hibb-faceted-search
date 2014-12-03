!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FacetedSearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

},{}],2:[function(_dereq_,module,exports){
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

},{}],3:[function(_dereq_,module,exports){
(function(){module.exports={generateID:function(t){var n,r;for(t=null!=t&&t>0?t-1:7,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=n.charAt(Math.floor(52*Math.random()));t--;)r+=n.charAt(Math.floor(Math.random()*n.length));return r},setResetTimeout:function(){var t;return t=null,function(n,r,e){return null!=t&&(null!=e&&e(),clearTimeout(t)),t=setTimeout(function(){return t=null,r()},n)}}()}}).call(this);
},{}],4:[function(_dereq_,module,exports){
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

  Pagination.prototype.className = 'pagination';


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
buf.push("<li" + (jade.cls(['prev10',currentPageNumber>10?'active':''], [null,true])) + ">&laquo;</li>");
}
buf.push("<li" + (jade.cls(['prev',currentPageNumber>1?'active':''], [null,true])) + ">&lsaquo;</li>");
if ( (showPageNames != null))
{
buf.push("<li class=\"pageNameSingular\">" + (jade.escape(null == (jade_interp = showPageNames[0]) ? "" : jade_interp)) + "</li>");
}
buf.push("<li class=\"current\"><input type=\"text\"" + (jade.attr("value", currentPageNumber, true, false)) + "/><span>" + (jade.escape(null == (jade_interp = currentPageNumber) ? "" : jade_interp)) + "</span></li><li class=\"text\">of</li><li class=\"pagecount\">" + (jade.escape(null == (jade_interp = pageCount) ? "" : jade_interp)) + "</li>");
if ( (showPageNames != null))
{
buf.push("<li class=\"pageNamePlural\">" + (jade.escape(null == (jade_interp = showPageNames[1]) ? "" : jade_interp)) + "</li>");
}
buf.push("<li" + (jade.cls(['next',currentPageNumber<pageCount?'active':''], [null,true])) + ">&rsaquo;</li>");
if ( (step10 && pageCount >= 10))
{
buf.push("<li" + (jade.cls(['next10',currentPageNumber<=pageCount-10?'active':''], [null,true])) + ">&raquo;</li>");
}}.call(this,"step10" in locals_for_with?locals_for_with.step10:typeof step10!=="undefined"?step10:undefined,"pageCount" in locals_for_with?locals_for_with.pageCount:typeof pageCount!=="undefined"?pageCount:undefined,"currentPageNumber" in locals_for_with?locals_for_with.currentPageNumber:typeof currentPageNumber!=="undefined"?currentPageNumber:undefined,"showPageNames" in locals_for_with?locals_for_with.showPageNames:typeof showPageNames!=="undefined"?showPageNames:undefined));;return buf.join("");
};
},{"jade/runtime":2}]},{},[3])
(3)
});
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(_dereq_,module,exports){
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
    str =  str || _dereq_('fs').readFileSync(filename, 'utf8')
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
},{}],6:[function(_dereq_,module,exports){
var Backbone, ListOptions, Models, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

Models = {
  Option: _dereq_('../models/facets/list.option.coffee')
};

ListOptions = (function(_super) {
  __extends(ListOptions, _super);

  function ListOptions() {
    return ListOptions.__super__.constructor.apply(this, arguments);
  }

  ListOptions.prototype.model = Models.Option;

  ListOptions.prototype.initialize = function() {
    return this.comparator = this.strategies.amount_desc;
  };

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

  ListOptions.prototype.updateOptions = function(newOptions) {
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
          opt = new Models.Option(newOption);
          return _this.add(opt);
        }
      };
    })(this));
    return this.sort();
  };

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

  ListOptions.prototype.orderBy = function(strategy, silent) {
    if (silent == null) {
      silent = false;
    }
    this.comparator = this.strategies[strategy];
    return this.sort({
      silent: silent
    });
  };

  ListOptions.prototype.setAllVisible = function() {
    this.each(function(model) {
      return model.set('visible', true);
    });
    return this.sort();
  };

  return ListOptions;

})(Backbone.Collection);

module.exports = ListOptions;



},{"../models/facets/list.option.coffee":13}],7:[function(_dereq_,module,exports){
var Backbone, SearchResult, SearchResults, funcky, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

SearchResult = _dereq_('../models/searchresult');

funcky = _dereq_('funcky.req');


/*
@class
 */

SearchResults = (function(_super) {
  __extends(SearchResults, _super);

  function SearchResults() {
    return SearchResults.__super__.constructor.apply(this, arguments);
  }

  SearchResults.prototype.model = SearchResult;


  /*
  	@constructs
   */

  SearchResults.prototype.initialize = function(models, options) {
    this.config = options.config;
    return this.cachedModels = {};
  };

  SearchResults.prototype.clearCache = function() {
    return this.cachedModels = {};
  };

  SearchResults.prototype.getCurrent = function() {
    return this._current;
  };

  SearchResults.prototype._setCurrent = function(_current, changeMessage) {
    this._current = _current;
    return this.trigger(changeMessage, this._current);
  };


  /*
  	@method
  	@param {string} url - Base location of the resultModel. Is used to fetch parts of the result which are not prev or next but at a different place (for example: row 100 - 110) in the result set.
  	@param {object} attrs - The properties/attributes of the resultModel.
  	@param {string} cacheId - The ID to file the props/attrs under for caching.
  	@param {string} changeMessage - The event message to trigger.
   */

  SearchResults.prototype._addModel = function(url, attrs, cacheId, changeMessage) {
    attrs.location = url;
    this.cachedModels[cacheId] = new this.model(attrs);
    this.add(this.cachedModels[cacheId]);
    return this._setCurrent(this.cachedModels[cacheId], changeMessage);
  };


  /*
  	@method
  	@param {object} queryOptions
  	@param {object} [options={}]
  	@param {boolean} options.cache - Determines if the result can be fetched from the cachedModels (searchResult models). In case of a reset or a refresh, options.cache is set to false.
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
          getUrl = "" + url + "?rows=" + (_this.config.get('resultRows'));
          return _this.getResults(getUrl, function(response) {
            return _this._addModel(url, response, queryOptionsString, changeMessage);
          });
        };
      })(this));
    }
  };

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
    start = this.config.get('resultRows') * (pagenumber - 1);
    url = this._current.get('location') + ("?rows=" + (this.config.get('resultRows')) + "&start=" + start);
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
    if (this.config.has('authorizationHeaderToken')) {
      ajaxOptions.headers = {
        Authorization: this.config.get('authorizationHeaderToken')
      };
    }
    if (this.config.has('requestOptions')) {
      _.extend(ajaxOptions, this.config.get('requestOptions'));
    }
    req = funcky.post(this.config.get('baseUrl') + this.config.get('searchPath'), ajaxOptions);
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
    if (this.config.has('authorizationHeaderToken')) {
      options = {
        headers: {
          Authorization: this.config.get('authorizationHeaderToken')
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



},{"../models/searchresult":18,"funcky.req":2}],8:[function(_dereq_,module,exports){
var Backbone, Config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

Config = (function(_super) {
  __extends(Config, _super);

  function Config() {
    return Config.__super__.constructor.apply(this, arguments);
  }

  Config.prototype.defaults = function() {
    return {
      resultRows: 10,
      baseUrl: '',
      searchPath: '',
      textSearch: 'advanced',
      authorizationHeaderToken: null,
      queryOptions: {},
      facetTitleMap: {},
      templates: {},
      autoSearch: true,
      requestOptions: {},
      results: false,
      entryTermSingular: 'entry',
      entryTermPlural: 'entries',
      entryMetadataFields: [],
      levels: []
    };
  };

  return Config;

})(Backbone.Model);

module.exports = Config;



},{}],9:[function(_dereq_,module,exports){
var $, Backbone, Config, MainView, QueryOptions, SearchResults, Views, funcky, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

Backbone.$ = $;

_ = _dereq_('underscore');

funcky = _dereq_('funcky.el').el;

Config = _dereq_('./config');

QueryOptions = _dereq_('./models/query-options');

SearchResults = _dereq_('./collections/searchresults');

Views = {
  TextSearch: _dereq_('./views/text-search'),
  Facets: _dereq_('./views/facets'),
  Results: _dereq_('./views/results')
};

tpl = _dereq_('../jade/main.jade');

MainView = (function(_super) {
  __extends(MainView, _super);

  function MainView() {
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.initialize = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.facetViewMap != null) {
      this.facetViewMap = _.clone(options.facetViewMap);
      delete options.facetViewMap;
    }
    this.extendConfig(options);
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

  MainView.prototype.render = function() {
    if (this.config.get('templates').hasOwnProperty('main')) {
      tpl = this.config.get('templates').main;
    }
    this.el.innerHTML = tpl();
    this.initFacets(this.facetViewMap);
    this.$('.faceted-search').addClass("search-type-" + (this.config.get('textSearch')));
    if (this.config.get('textSearch') === 'simple' || this.config.get('textSearch') === 'advanced') {
      this.renderTextSearch();
    }
    if (this.config.get('results')) {
      this.renderResults();
    }
    return this;
  };

  MainView.prototype.renderTextSearch = function() {
    var textSearchPlaceholder;
    this.textSearch = new Views.TextSearch({
      config: this.config
    });
    textSearchPlaceholder = this.el.querySelector('.text-search-placeholder');
    textSearchPlaceholder.parentNode.replaceChild(this.textSearch.el, textSearchPlaceholder);
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

  MainView.prototype.renderResults = function() {
    this.$el.addClass('with-results');
    this.results = new Views.Results({
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

  MainView.prototype.events = function() {
    return {
      'click ul.facets-menu li.collapse-expand': function(ev) {
        return this.facets.toggle(ev);
      },
      'click ul.facets-menu li.reset': 'onReset',
      'click ul.facets-menu li.switch button': 'onSwitchType'
    };
  };

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

  MainView.prototype.onReset = function(ev) {
    ev.preventDefault();
    return this.reset();
  };

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

  MainView.prototype.extendConfig = function(options) {
    var ftm;
    ftm = options.facetTitleMap;
    delete options.facetTitleMap;
    this.config = new Config(options);
    this.config.set({
      facetTitleMap: _.extend(this.config.get('facetTitleMap'), ftm)
    });
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

  MainView.prototype.initQueryOptions = function() {
    var attrs;
    attrs = _.extend(this.config.get('queryOptions'), this.config.get('textSearchOptions'));
    this.queryOptions = new QueryOptions(attrs);
    if (this.config.get('autoSearch')) {
      return this.listenTo(this.queryOptions, 'change', (function(_this) {
        return function() {
          return _this.search();
        };
      })(this));
    }
  };

  MainView.prototype.initSearchResults = function() {
    this.searchResults = new SearchResults(null, {
      config: this.config
    });
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
        return _this.trigger('change:results', responseModel);
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

  MainView.prototype.initFacets = function(viewMap) {
    var facetsPlaceholder;
    if (viewMap == null) {
      viewMap = {};
    }
    this.facets = new Views.Facets({
      viewMap: viewMap,
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

  MainView.prototype.hideLoader = function() {
    return this.el.querySelector('.overlay').style.display = 'none';
  };

  MainView.prototype.update = function() {
    var facets;
    facets = this.searchResults.getCurrent().get('facets');
    if (this.searchResults.length === 1) {
      return this.facets.renderFacets(facets);
    } else if (this.searchResults.length > 1) {
      return this.facets.update(facets);
    }
  };

  MainView.prototype.page = function(pagenumber, database) {
    return this.searchResults.page(pagenumber, database);
  };

  MainView.prototype.next = function() {
    return this.searchResults.moveCursor('_next');
  };

  MainView.prototype.prev = function() {
    return this.searchResults.moveCursor('_prev');
  };

  MainView.prototype.hasNext = function() {
    return this.searchResults.getCurrent().has('_next');
  };

  MainView.prototype.hasPrev = function() {
    return this.searchResults.getCurrent().has('_prev');
  };

  MainView.prototype.sortResultsBy = function(sortParameters) {
    return this.queryOptions.set({
      sortParameters: sortParameters,
      resultFields: _.pluck(sortParameters, 'fieldname')
    });
  };

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

  MainView.prototype.refresh = function(newQueryOptions) {
    if (newQueryOptions == null) {
      newQueryOptions = {};
    }
    if (Object.keys(newQueryOptions).length > 0) {
      this.set(newQueryOptions, {
        silent: true
      });
    }
    return this.search({
      cache: false
    });
  };

  MainView.prototype.search = function(options) {
    return this.searchResults.runQuery(this.queryOptions.attributes, options);
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;



},{"../jade/main.jade":40,"./collections/searchresults":7,"./config":8,"./models/query-options":16,"./views/facets":19,"./views/results":26,"./views/text-search":32,"funcky.el":1}],10:[function(_dereq_,module,exports){
var BooleanFacet, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./main')
};

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }

  BooleanFacet.prototype.set = function(attrs, options) {
    if (attrs === 'options') {
      options = this.parseOptions(options);
    } else if (attrs.hasOwnProperty('options')) {
      attrs.options = this.parseOptions(attrs.options);
    }
    return BooleanFacet.__super__.set.call(this, attrs, options);
  };

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

})(Models.Facet);

module.exports = BooleanFacet;



},{"./main":14}],11:[function(_dereq_,module,exports){




},{}],12:[function(_dereq_,module,exports){
var List, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./main')
};

List = (function(_super) {
  __extends(List, _super);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  return List;

})(Models.Facet);

module.exports = List;



},{"./main":14}],13:[function(_dereq_,module,exports){
var Backbone, ListOption,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

ListOption = (function(_super) {
  __extends(ListOption, _super);

  function ListOption() {
    return ListOption.__super__.constructor.apply(this, arguments);
  }

  ListOption.prototype.idAttribute = 'name';

  ListOption.prototype.defaults = function() {
    return {
      name: '',
      count: 0,
      total: 0,
      checked: false,
      visible: false
    };
  };

  ListOption.prototype.parse = function(attrs) {
    attrs.total = attrs.count;
    return attrs;
  };

  return ListOption;

})(Backbone.Model);

module.exports = ListOption;



},{}],14:[function(_dereq_,module,exports){
var Backbone, Facet, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

config = _dereq_('../../config');

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.idAttribute = 'name';

  Facet.prototype.defaults = function() {
    return {
      name: null,
      title: null,
      type: null,
      options: null
    };
  };

  return Facet;

})(Backbone.Model);

module.exports = Facet;



},{"../../config":8}],15:[function(_dereq_,module,exports){
var FacetModel, RangeFacet, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FacetModel = _dereq_('./main');

_ = _dereq_('underscore');

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    this.dragMax = __bind(this.dragMax, this);
    this.dragMin = __bind(this.dragMin, this);
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.defaults = function() {
    return _.extend({}, RangeFacet.__super__.defaults.apply(this, arguments), {
      min: null,
      max: null,
      currentMin: null,
      currentMax: null,
      handleMinLeft: null,
      handleMaxLeft: null,
      sliderWidth: null,
      options: {}
    });
  };

  RangeFacet.prototype.initialize = function() {
    this.on('change:currentMin', (function(_this) {
      return function(model, value) {
        return _this.set({
          handleMinLeft: _this.getLeftFromYear(value)
        });
      };
    })(this));
    this.on('change:currentMax', (function(_this) {
      return function(model, value) {
        return _this.set({
          handleMaxLeft: _this.getLeftFromYear(value)
        });
      };
    })(this));
    this.on('change:handleMinLeft', (function(_this) {
      return function(model, value) {
        return _this.set({
          currentMin: _this.getYearFromLeft(value)
        });
      };
    })(this));
    return this.on('change:handleMaxLeft', (function(_this) {
      return function(model, value) {
        return _this.set({
          currentMax: _this.getYearFromLeft(value)
        });
      };
    })(this));
  };

  RangeFacet.prototype.set = function(attrs, options) {
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
    if (attrs.hasOwnProperty('currentMin') && attrs.currentMin < this.get('min')) {
      attrs.currentMin = this.get('min');
    }
    if (attrs.hasOwnProperty('currentMax') && attrs.currentMax > this.get('max')) {
      attrs.currentMax = this.get('max');
    }
    return RangeFacet.__super__.set.apply(this, arguments);
  };

  RangeFacet.prototype.parse = function(attrs) {
    var getYear, ll, ul;
    RangeFacet.__super__.parse.apply(this, arguments);
    getYear = function(str) {
      if (str.length === 8) {
        str = str.substr(0, 4);
      } else if (str.length === 7) {
        str = str.substr(0, 3);
      } else {
        throw new Error("RangeFacet: lower or upper limit string is not 7 or 8 chars!");
      }
      return +str;
    };
    ll = attrs.options[0].lowerLimit + '';
    ul = attrs.options[0].upperLimit + '';
    attrs.min = attrs.currentMin = attrs.options.lowerLimit = getYear(ll);
    attrs.max = attrs.currentMax = attrs.options.upperLimit = getYear(ul);
    return attrs;
  };

  RangeFacet.prototype.getLeftFromYear = function(year) {
    var hhw, ll, sw, ul;
    ll = this.get('options').lowerLimit;
    ul = this.get('options').upperLimit;
    sw = this.get('sliderWidth');
    hhw = this.get('handleWidth') / 2;
    return (((year - ll) / (ul - ll)) * sw) - hhw;
  };

  RangeFacet.prototype.getYearFromLeft = function(left) {
    var hhw, ll, sw, ul;
    ll = this.get('options').lowerLimit;
    ul = this.get('options').upperLimit;
    hhw = this.get('handleWidth') / 2;
    sw = this.get('sliderWidth');
    return (((left + hhw) / sw) * (ul - ll)) + ll;
  };

  RangeFacet.prototype.dragMin = function(pos) {
    if ((-1 < pos && pos <= this.get('handleMaxLeft'))) {
      return this.set({
        handleMinLeft: pos
      });
    }
  };

  RangeFacet.prototype.dragMax = function(pos) {
    if ((this.get('handleMinLeft') < pos && pos <= this.get('sliderWidth'))) {
      return this.set({
        handleMaxLeft: pos
      });
    }
  };

  return RangeFacet;

})(FacetModel);

module.exports = RangeFacet;



},{"./main":14}],16:[function(_dereq_,module,exports){
var Backbone, QueryOptions, config, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

config = _dereq_('../config');

QueryOptions = (function(_super) {
  __extends(QueryOptions, _super);

  function QueryOptions() {
    return QueryOptions.__super__.constructor.apply(this, arguments);
  }


  /*
  	@prop {array} facetValues=[] - Array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
  	@prop {array} sortParameters=[] - Array of objects containing fieldname and direction: {fieldname: 'language', direction: 'desc'}
   */

  QueryOptions.prototype.defaults = function() {
    return {
      facetValues: [],
      sortParameters: []
    };
  };


  /*
  	@constructs
  	@param {object} this.initialAttributes - The initial attributes are stored and not mutated, because on reset the original data is needed.
   */

  QueryOptions.prototype.initialize = function(initialAttributes) {
    this.initialAttributes = initialAttributes;
  };

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



},{"../config":8}],17:[function(_dereq_,module,exports){
var Backbone, Search, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

Search = (function(_super) {
  __extends(Search, _super);

  function Search() {
    return Search.__super__.constructor.apply(this, arguments);
  }

  Search.prototype.defaults = function() {
    return {
      term: '*',
      caseSensitive: false,
      fuzzy: false,
      title: 'Text Search',
      name: 'text_search'
    };
  };

  Search.prototype.queryData = function() {
    var attrs;
    attrs = _.extend({}, this.attributes);
    delete attrs.name;
    delete attrs.title;
    return attrs;
  };

  return Search;

})(Backbone.Model);

module.exports = Search;



},{}],18:[function(_dereq_,module,exports){
var Backbone, SearchResult, config, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

config = _dereq_('../config');

SearchResult = (function(_super) {
  __extends(SearchResult, _super);

  function SearchResult() {
    return SearchResult.__super__.constructor.apply(this, arguments);
  }

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
      term: '',
      facets: []
    };
  };

  return SearchResult;

})(Backbone.Model);

module.exports = SearchResult;



},{"../config":8}],19:[function(_dereq_,module,exports){
var $, Backbone, Facets, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

$ = _dereq_('jquery');

Facets = (function(_super) {
  __extends(Facets, _super);

  function Facets() {
    this.renderFacet = __bind(this.renderFacet, this);
    return Facets.__super__.constructor.apply(this, arguments);
  }

  Facets.prototype.className = 'facets';

  Facets.prototype.viewMap = {
    BOOLEAN: _dereq_('./facets/boolean'),
    DATE: _dereq_('./facets/date'),
    RANGE: _dereq_('./facets/range'),
    LIST: _dereq_('./facets/list')
  };

  Facets.prototype.initialize = function(options) {
    _.extend(this.viewMap, options.viewMap);
    this.config = options.config;
    this.views = {};
    return this.render();
  };

  Facets.prototype.render = function() {
    var tpl;
    if (this.config.get('templates').hasOwnProperty('facets')) {
      tpl = this.config.get('templates').facets;
      this.el.innerHTML = tpl();
    }
    return this;
  };

  Facets.prototype.renderFacets = function(data) {
    var facetData, fragment, index, placeholder, _i, _len;
    this.destroyFacets();
    if (this.config.get('templates').hasOwnProperty('facets')) {
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        facetData = data[index];
        if (this.viewMap.hasOwnProperty(facetData.type)) {
          placeholder = this.el.querySelector("." + facetData.name + "-placeholder");
          if (placeholder != null) {
            placeholder.parentNode.replaceChild(this.renderFacet(facetData).el, placeholder);
          }
        }
      }
    } else {
      fragment = document.createDocumentFragment();
      for (index in data) {
        if (!__hasProp.call(data, index)) continue;
        facetData = data[index];
        if (this.viewMap.hasOwnProperty(facetData.type)) {
          fragment.appendChild(this.renderFacet(facetData).el);
          fragment.appendChild(document.createElement('hr'));
        } else {
          console.error('Unknown facetView', facetData.type);
        }
      }
      this.el.innerHTML = '';
      this.el.appendChild(fragment);
    }
    return this;
  };

  Facets.prototype.renderFacet = function(facetData) {
    var View;
    if (_.isString(facetData)) {
      facetData = _.findWhere(this.searchResults.first().get('facets'), {
        name: facetData
      });
    }
    View = this.viewMap[facetData.type];
    this.views[facetData.name] = new View({
      attrs: facetData,
      config: this.config
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

  Facets.prototype.destroyFacets = function() {
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

  Facets.prototype.destroy = function() {
    this.destroyFacets();
    return this.remove();
  };

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



},{"./facets/boolean":20,"./facets/date":21,"./facets/list":22,"./facets/range":25}],20:[function(_dereq_,module,exports){
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

BooleanFacet = (function(_super) {
  __extends(BooleanFacet, _super);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }

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



},{"../../../jade/facets/boolean.body.jade":33,"../../models/facets/boolean":10,"./main":24}],21:[function(_dereq_,module,exports){
var DateFacet, Models, Views, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Date: _dereq_('../../models/facets/date')
};

Views = {
  Facet: _dereq_('./main')
};

tpl = _dereq_('../../../jade/facets/date.jade');

DateFacet = (function(_super) {
  __extends(DateFacet, _super);

  function DateFacet() {
    return DateFacet.__super__.constructor.apply(this, arguments);
  }

  DateFacet.prototype.className = 'facet date';

  DateFacet.prototype.initialize = function(options) {
    DateFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.Date(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  DateFacet.prototype.render = function() {
    var rtpl;
    DateFacet.__super__.render.apply(this, arguments);
    rtpl = tpl(_.extend(this.model.attributes, {
      ucfirst: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
    }));
    this.$('.placeholder').html(rtpl);
    return this;
  };

  DateFacet.prototype.update = function(newOptions) {};

  DateFacet.prototype.reset = function() {};

  return DateFacet;

})(Views.Facet);

module.exports = DateFacet;



},{"../../../jade/facets/date.jade":34,"../../models/facets/date":11,"./main":24}],22:[function(_dereq_,module,exports){
var $, Collections, ListFacet, Models, Views, menuTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Models = {
  List: _dereq_('../../models/facets/list')
};

Collections = {
  Options: _dereq_('../../collections/list.options')
};

Views = {
  Facet: _dereq_('./main'),
  Options: _dereq_('./list.options')
};

menuTpl = _dereq_('../../../jade/facets/list.menu.jade');

ListFacet = (function(_super) {
  __extends(ListFacet, _super);

  function ListFacet() {
    return ListFacet.__super__.constructor.apply(this, arguments);
  }

  ListFacet.prototype.className = 'facet list';

  ListFacet.prototype.initialize = function(options) {
    ListFacet.__super__.initialize.apply(this, arguments);
    this.resetActive = false;
    this.config = options.config;
    this.model = new Models.List(options.attrs, {
      parse: true
    });
    this.collection = new Collections.Options(options.attrs.options, {
      parse: true
    });
    return this.render();
  };

  ListFacet.prototype.render = function() {
    var menu;
    ListFacet.__super__.render.apply(this, arguments);
    if (this.$('header .options').length > 0) {
      if (this.config.get('templates').hasOwnProperty('list.menu')) {
        menuTpl = this.config.get('templates')['list.menu'];
      }
      menu = menuTpl({
        model: this.model.attributes
      });
      this.$('header .options').html(menu);
    }
    this.optionsView = new Views.Options({
      collection: this.collection,
      facetName: this.model.get('name'),
      config: this.config
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

  ListFacet.prototype.events = function() {
    return _.extend({}, ListFacet.__super__.events.apply(this, arguments), {
      'keyup input[name="filter"]': function(ev) {
        return this.optionsView.filterOptions(ev.currentTarget.value);
      },
      'change header .options input[type="checkbox"][name="all"]': function(ev) {
        return this.optionsView.setCheckboxes(ev);
      },
      'click header .menu i.filter': 'toggleFilterMenu',
      'click header .menu i.alpha': 'changeOrder',
      'click header .menu i.amount': 'changeOrder'
    });
  };

  ListFacet.prototype.toggleFilterMenu = function() {
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

  ListFacet.prototype.changeOrder = function(ev) {
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

  ListFacet.prototype.update = function(newOptions) {
    if (this.resetActive) {
      this.collection.reset(newOptions, {
        parse: true
      });
      return this.resetActive = false;
    } else {
      return this.collection.updateOptions(newOptions);
    }
  };

  ListFacet.prototype.reset = function() {
    this.resetActive = true;
    if (this.$('i.filter').hasClass('active')) {
      return this.toggleFilterMenu();
    }
  };

  return ListFacet;

})(Views.Facet);

module.exports = ListFacet;



},{"../../../jade/facets/list.menu.jade":36,"../../collections/list.options":6,"../../models/facets/list":12,"./list.options":23,"./main":24}],23:[function(_dereq_,module,exports){
var $, Backbone, ListFacetOptions, Models, bodyTpl, funcky, optionTpl, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

funcky = _dereq_('funcky.util');

Models = {
  List: _dereq_('../../models/facets/list')
};

bodyTpl = _dereq_('../../../jade/facets/list.body.jade');

optionTpl = _dereq_('../../../jade/facets/list.option.jade');

ListFacetOptions = (function(_super) {
  __extends(ListFacetOptions, _super);

  function ListFacetOptions() {
    this.triggerChange = __bind(this.triggerChange, this);
    return ListFacetOptions.__super__.constructor.apply(this, arguments);
  }

  ListFacetOptions.prototype.className = 'container';

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

  ListFacetOptions.prototype.renderAll = function() {
    return this.collection.setAllVisible();
  };

  ListFacetOptions.prototype.events = function() {
    return {
      'click li': 'checkChanged',
      'scroll': 'onScroll'
    };
  };

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

  ListFacetOptions.prototype.checkChanged = function(ev) {
    var $target, checked, id, unchecked;
    $target = $(ev.currentTarget);
    id = $target.attr('data-value');
    checked = $target.find("i.checked");
    unchecked = $target.find("i.unchecked");
    if (checked.is(':visible')) {
      checked.hide();
      unchecked.css('display', 'inline-block');
    } else {
      checked.css('display', 'inline-block');
      unchecked.hide();
    }
    this.collection.get(id).set('checked', $target.find("i.checked").is(':visible'));
    if (this.$('i.checked').length === 0 || !this.config.get('autoSearch')) {
      return this.triggerChange();
    } else {
      return funcky.setResetTimeout(1000, (function(_this) {
        return function() {
          return _this.triggerChange();
        };
      })(this));
    }
  };

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
  	Called by parent (ListFacet) when user types in the search input
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



},{"../../../jade/facets/list.body.jade":35,"../../../jade/facets/list.option.jade":37,"../../models/facets/list":12,"funcky.util":3}],24:[function(_dereq_,module,exports){
var $, Backbone, Facet, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

tpl = _dereq_('../../../jade/facets/main.jade');

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.initialize = function(options) {
    this.config = options.config;
    if (this.config.get('facetTitleMap').hasOwnProperty(options.attrs.name)) {
      return options.attrs.title = this.config.get('facetTitleMap')[options.attrs.name];
    }
  };

  Facet.prototype.render = function() {
    if (this.config.get('templates').hasOwnProperty('facets.main')) {
      tpl = this.config.get('templates')['facets.main'];
    }
    this.$el.html(tpl(this.model.attributes));
    this.$el.attr('data-name', this.model.get('name'));
    return this;
  };

  Facet.prototype.events = function() {
    return {
      'click h3': 'toggleBody'
    };
  };

  Facet.prototype.toggleBody = function(ev) {
    var func;
    func = this.$('.body').is(':visible') ? this.hideBody : this.showBody;
    if (_.isFunction(ev)) {
      return func.call(this, ev);
    } else {
      return func.call(this);
    }
  };

  Facet.prototype.hideMenu = function() {
    var $button;
    $button = this.$('header i.openclose');
    $button.addClass('fa-plus-square-o');
    $button.removeClass('fa-minus-square-o');
    return this.$('header .options').slideUp(150);
  };

  Facet.prototype.hideBody = function(done) {
    this.hideMenu();
    return this.$('.body').slideUp(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeOut(100);
      };
    })(this));
  };

  Facet.prototype.showBody = function(done) {
    return this.$('.body').slideDown(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header i.fa').fadeIn(100);
      };
    })(this));
  };

  Facet.prototype.destroy = function() {
    return this.remove();
  };

  Facet.prototype.update = function(newOptions) {};

  Facet.prototype.reset = function() {};

  return Facet;

})(Backbone.View);

module.exports = Facet;



},{"../../../jade/facets/main.jade":38}],25:[function(_dereq_,module,exports){
var $, Models, RangeFacet, Views, bodyTpl, dragStopper, resizer, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Models = {
  Range: _dereq_('../../models/facets/range')
};

Views = {
  Facet: _dereq_('./main')
};

bodyTpl = _dereq_('../../../jade/facets/range.body.jade');

dragStopper = null;

resizer = null;

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.className = 'facet range';

  RangeFacet.prototype.initialize = function(options) {
    RangeFacet.__super__.initialize.apply(this, arguments);
    this.config = options.config;
    this.draggingMin = false;
    this.draggingMax = false;
    this.model = new Models.Range(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    this.listenTo(this.model, 'change', (function(_this) {
      return function(model) {
        if (model.changed.hasOwnProperty('currentMin') || model.changed.hasOwnProperty('currentMax')) {
          if ((_this.button != null) && _this.config.get('autoSearch')) {
            return _this.button.style.display = 'block';
          }
        }
      };
    })(this));
    this.listenTo(this.model, 'change:handleMinLeft', (function(_this) {
      return function(model, value) {
        _this.handleMin.css('left', value);
        return _this.bar.css('left', value);
      };
    })(this));
    this.listenTo(this.model, 'change:handleMaxLeft', (function(_this) {
      return function(model, value) {
        _this.handleMax.css('left', value);
        return _this.bar.css('right', model.get('sliderWidth') - value);
      };
    })(this));
    this.listenTo(this.model, 'change:currentMin', (function(_this) {
      return function(model, value) {
        return _this.inputMin.val(Math.ceil(value));
      };
    })(this));
    this.listenTo(this.model, 'change:currentMax', (function(_this) {
      return function(model, value) {
        return _this.inputMax.val(Math.ceil(value));
      };
    })(this));
    return this.render();
  };

  RangeFacet.prototype.render = function() {
    var rtpl;
    RangeFacet.__super__.render.apply(this, arguments);
    if (this.config.get('templates').hasOwnProperty('range.body')) {
      bodyTpl = this.config.get('templates')['range.body'];
    }
    rtpl = bodyTpl(this.model.attributes);
    this.$('.body').html(rtpl);
    this.$('header .menu').hide();
    dragStopper = this.stopDragging.bind(this);
    this.$el.on('mouseleave', dragStopper);
    resizer = this.onResize.bind(this);
    window.addEventListener('resize', resizer);
    setTimeout(((function(_this) {
      return function() {
        return _this.postRender();
      };
    })(this)), 0);
    return this;
  };

  RangeFacet.prototype.postRender = function() {
    var slider;
    this.handleMin = this.$('.handle-min');
    this.handleMax = this.$('.handle-max');
    this.inputMin = this.$('input.min');
    this.inputMax = this.$('input.max');
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

  RangeFacet.prototype.events = function() {
    return _.extend({}, RangeFacet.__super__.events.apply(this, arguments), {
      'mousedown .handle': 'startDragging',
      'mousedown .bar': 'startDragging',
      'mouseup': 'stopDragging',
      'mousemove': 'drag',
      'blur input': 'setYear',
      'keyup input': 'setYear',
      'click button': 'doSearch',
      'dblclick input.min': function(ev) {
        return this.enableInputEditable(this.inputMin);
      },
      'dblclick input.max': function(ev) {
        return this.enableInputEditable(this.inputMax);
      }
    });
  };

  RangeFacet.prototype.setYear = function(ev) {
    if (ev.type === 'focusout' || ev.type === 'blur' || (ev.type === 'keyup' && ev.keyCode === 13)) {
      if (ev.currentTarget.className.indexOf('min') > -1) {
        this.model.set({
          currentMin: +ev.currentTarget.value
        });
        return this.disableInputEditable(this.inputMin);
      } else if (ev.currentTarget.className.indexOf('max') > -1) {
        this.model.set({
          currentMax: +ev.currentTarget.value
        });
        return this.disableInputEditable(this.inputMax);
      }
    }
  };

  RangeFacet.prototype.doSearch = function(ev) {
    ev.preventDefault();
    return this.triggerChange();
  };

  RangeFacet.prototype.startDragging = function(ev) {
    var input, target;
    target = $(ev.currentTarget);
    input = target.find('input');
    if (input.length > 0) {
      if (input.attr('disabled') == null) {
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

  RangeFacet.prototype.stopDragging = function() {
    if (this.draggingMin || this.draggingMax || (this.draggingBar != null)) {
      if (this.draggingMin) {
        if (this.model.get('currentMin') !== +this.inputMin.val()) {
          this.model.set({
            currentMin: +this.inputMin.val()
          });
        }
      }
      if (this.draggingMax) {
        if (this.model.get('currentMax') !== +this.inputMax.val()) {
          this.model.set({
            currentMax: +this.inputMax.val()
          });
        }
      }
      this.draggingMin = false;
      this.draggingMax = false;
      this.draggingBar = null;
      if (!this.config.get('autoSearch')) {
        return this.triggerChange({
          silent: true
        });
      }
    }
  };

  RangeFacet.prototype.enableInputEditable = function(input) {
    input.attr('disabled', null);
    return input.focus();
  };

  RangeFacet.prototype.disableInputEditable = function(input) {
    return input.attr('disabled', true);
  };

  RangeFacet.prototype.destroy = function() {
    this.$el.off('mouseleave', dragStopper);
    window.removeEventListener('resize', resizer);
    return this.remove();
  };

  RangeFacet.prototype.triggerChange = function(options) {
    var queryOptions;
    if (options == null) {
      options = {};
    }
    queryOptions = {
      facetValue: {
        name: this.model.get('name'),
        lowerLimit: this.model.get('currentMin') + '0101',
        upperLimit: this.model.get('currentMax') + '1231'
      }
    };
    return this.trigger('change', queryOptions, options);
  };

  RangeFacet.prototype.onResize = function() {
    this.postRender();
    this.update({
      lowerLimit: this.model.get('currentMin'),
      upperLimit: this.model.get('currentMax')
    });
    return this.checkInputOverlap();
  };

  RangeFacet.prototype.checkInputOverlap = function() {
    var diff, maxRect, minRect;
    minRect = this.inputMin[0].getBoundingClientRect();
    maxRect = this.inputMax[0].getBoundingClientRect();
    if (!(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)) {
      diff = minRect.right - maxRect.left;
      return this.enableInputOverlap(diff);
    } else {
      return this.disableInputOverlap();
    }
  };

  RangeFacet.prototype.enableInputOverlap = function(diff) {
    this.inputMin.css('left', -20 - diff / 2);
    this.inputMax.css('right', -20 - diff / 2);
    this.updateDash();
    this.$('.dash').show();
    this.inputMin.addClass('overlap');
    return this.inputMax.addClass('overlap');
  };

  RangeFacet.prototype.disableInputOverlap = function() {
    this.inputMin.css('left', -20);
    this.inputMax.css('right', -20);
    this.$('.dash').hide();
    this.inputMin.removeClass('overlap');
    return this.inputMax.removeClass('overlap');
  };

  RangeFacet.prototype.updateDash = function() {
    return this.$('.dash').css('left', this.model.get('handleMinLeft') + ((this.model.get('handleMaxLeft') - this.model.get('handleMinLeft')) / 2) + 3);
  };

  RangeFacet.prototype.update = function(newOptions) {
    if (_.isArray(newOptions)) {
      if (newOptions[0] != null) {
        newOptions = newOptions[0];
      } else {
        newOptions = {
          lowerLimit: this.model.get('options').lowerLimit,
          upperLimit: this.model.get('options').upperLimit
        };
      }
    }
    this.model.set({
      currentMin: +(newOptions.lowerLimit + '').substr(0, 4),
      currentMax: +(newOptions.upperLimit + '').substr(0, 4)
    });
    if (this.button != null) {
      return this.button.style.display = 'none';
    }
  };

  return RangeFacet;

})(Views.Facet);

module.exports = RangeFacet;



},{"../../../jade/facets/range.body.jade":39,"../../models/facets/range":15,"./main":24}],26:[function(_dereq_,module,exports){
var $, Backbone, Results, Views, listItems, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Views = {
  Result: _dereq_('./result'),
  SortLevels: _dereq_('./sort'),
  Pagination: _dereq_('huygens-backbone-pagination')
};

tpl = _dereq_('./index.jade');

listItems = [];

Results = (function(_super) {
  __extends(Results, _super);

  function Results() {
    return Results.__super__.constructor.apply(this, arguments);
  }


  /* options
  	@constructs
  	@param {object} this.options={}
  	@prop {object} options.config
  	@prop {Backbone.Collection} options.searchResults
   */

  Results.prototype.initialize = function(options) {
    this.options = options != null ? options : {};

    /*
    		@prop resultItems
     */
    this.resultItems = [];
    this.isMetadataVisible = true;
    this.listenTo(this.options.searchResults, 'change:page', this.renderResultsPage);
    this.listenTo(this.options.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        _this.$('header h3.numfound').html("Found " + (responseModel.get('numFound')) + " " + (_this.options.config.get('entryTermPlural')));
        _this.renderPagination(responseModel);
        return _this.renderResultsPage(responseModel);
      };
    })(this));
    this.subviews = {};
    return this.render();
  };

  Results.prototype.render = function() {
    this.$el.html(tpl({
      resultsPerPage: this.options.config.get('resultRows')
    }));
    this.renderLevels();
    $(window).resize((function(_this) {
      return function() {
        var pages;
        pages = _this.$('div.pages');
        return pages.height($(window).height() - pages.offset().top);
      };
    })(this));
    return this;
  };

  Results.prototype.renderLevels = function() {
    if (this.subviews.sortLevels != null) {
      this.subviews.sortLevels.destroy();
    }
    this.subviews.sortLevels = new Views.SortLevels({
      levels: this.options.config.get('levels'),
      entryMetadataFields: this.options.config.get('entryMetadataFields')
    });
    this.$('header nav ul').prepend(this.subviews.sortLevels.$el);
    return this.listenTo(this.subviews.sortLevels, 'change', (function(_this) {
      return function(sortParameters) {
        return _this.trigger('change:sort-levels', sortParameters);
      };
    })(this));
  };


  /*
  	@method renderResultsPage
  	@param {object} responseModel - The model returned by the server.
   */

  Results.prototype.renderResultsPage = function(responseModel) {
    var frag, fulltext, pageNumber, result, ul, _i, _len, _ref;
    this.destroyResultItems();
    this.$("div.pages").html('');
    fulltext = responseModel.has('term') && responseModel.get('term').indexOf('*:*') === -1 && responseModel.get('term').indexOf('*') === -1;
    frag = document.createDocumentFragment();
    _ref = responseModel.get('results');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      result = _ref[_i];
      result = new Views.Result({
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

  Results.prototype.renderPagination = function(responseModel) {
    if (this.subviews.pagination != null) {
      this.stopListening(this.subviews.pagination);
      this.subviews.pagination.destroy();
    }
    this.subviews.pagination = new Views.Pagination({
      resultsStart: responseModel.get('start'),
      resultsPerPage: this.options.config.get('resultRows'),
      resultsTotal: responseModel.get('numFound')
    });
    this.listenTo(this.subviews.pagination, 'change:pagenumber', this.changePage);
    return this.$('header .pagination').html(this.subviews.pagination.el);
  };

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

  Results.prototype.events = function() {
    return {
      'change li.show-metadata input': 'showMetadata',
      'change li.results-per-page select': 'onChangeResultsPerPage'
    };
  };

  Results.prototype.onChangeResultsPerPage = function(ev) {
    var t;
    t = ev.currentTarget;
    return this.options.config.set('resultRows', t.options[t.selectedIndex].value);
  };

  Results.prototype.showMetadata = function(ev) {
    this.isMetadataVisible = ev.currentTarget.checked;
    return this.$('.metadata').toggle(this.isMetadataVisible);
  };

  Results.prototype.reset = function() {
    return this.renderLevels();
  };

  Results.prototype.destroy = function() {
    this.destroyResultItems();
    return this.subviews.sortLevels.destroy();
  };

  Results.prototype.destroyResultItems = function() {
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



},{"./index.jade":27,"./result":28,"./sort":30,"huygens-backbone-pagination":4}],27:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (resultsPerPage) {
buf.push("<header><h3 class=\"numfound\"></h3><nav><ul><li class=\"results-per-page\"><select name=\"results-per-page\">");
// iterate [10, 25, 50, 100, 250, 500, 1000]
;(function(){
  var $$obj = [10, 25, 50, 100, 250, 500, 1000];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var count = $$obj[$index];

buf.push("<option" + (jade.attr("value", count, true, false)) + (jade.attr("selected", count===resultsPerPage, true, false)) + ">" + (jade.escape(null == (jade_interp = count + " results") ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var count = $$obj[$index];

buf.push("<option" + (jade.attr("value", count, true, false)) + (jade.attr("selected", count===resultsPerPage, true, false)) + ">" + (jade.escape(null == (jade_interp = count + " results") ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></li><li class=\"select-all\"><input id=\"i9d8sdf\" type=\"checkbox\"/><label for=\"i9d8sdf\">Select all</label></li><li class=\"show-metadata\"><input id=\"o45hes3\" type=\"checkbox\" checked=\"checked\"/><label for=\"o45hes3\">Show metadata</label></li></ul></nav><div class=\"pagination\"></div></header><div class=\"pages\"></div>");}("resultsPerPage" in locals_for_with?locals_for_with.resultsPerPage:typeof resultsPerPage!=="undefined"?resultsPerPage:undefined));;return buf.join("");
};
},{"jade/runtime":5}],28:[function(_dereq_,module,exports){
var Backbone, Result, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

tpl = _dereq_('./result.jade');


/*
@class Result
@extends Backbone.View
 */

Result = (function(_super) {
  __extends(Result, _super);

  function Result() {
    return Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.className = 'result';

  Result.prototype.tagName = 'li';


  /*
  	@param {object} [options={}]
  	@prop {object} options.data - The data of the result.
  	@prop {boolean} [options.fulltext=false] - Is the result coming from a full text search?
  	@constructs
   */

  Result.prototype.initialize = function(options) {
    var _base;
    this.options = options != null ? options : {};
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

  Result.prototype.events = function() {
    return {
      'click': '_handleClick',
      'click li[data-layer]': '_handleLayerClick'
    };
  };

  Result.prototype._handleClick = function(ev) {
    return this.trigger('click', this.options.data);
  };

  Result.prototype._handleLayerClick = function(ev) {
    var layer;
    ev.stopPropagation();
    layer = ev.currentTarget.getAttribute('data-layer');
    return this.trigger('layer:click', layer, this.options.data);
  };

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



},{"./result.jade":29}],29:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data, fulltext, found) {
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

buf.push("<li>" + (null == (jade_interp = row						) ? "" : jade_interp) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row						) ? "" : jade_interp) + "</li>");
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

buf.push("<li>" + (null == (jade_interp = row						) ? "" : jade_interp) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var row = $$obj[$index];

buf.push("<li>" + (null == (jade_interp = row						) ? "" : jade_interp) + "</li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
    }

  }
}).call(this);

}
buf.push("</ul></div>");
}}("data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"fulltext" in locals_for_with?locals_for_with.fulltext:typeof fulltext!=="undefined"?fulltext:undefined,"found" in locals_for_with?locals_for_with.found:typeof found!=="undefined"?found:undefined));;return buf.join("");
};
},{"jade/runtime":5}],30:[function(_dereq_,module,exports){
var $, Backbone, SortLevels, el, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

el = _dereq_('funcky.el').el;

tpl = _dereq_('./sort.jade');

SortLevels = (function(_super) {
  __extends(SortLevels, _super);

  function SortLevels() {
    return SortLevels.__super__.constructor.apply(this, arguments);
  }

  SortLevels.prototype.tagName = 'li';

  SortLevels.prototype.className = 'sort-levels';

  SortLevels.prototype.initialize = function(options) {
    this.options = options != null ? options : {};
    return this.render();
  };

  SortLevels.prototype.render = function() {
    var leave, levels, rtpl;
    rtpl = tpl({
      levels: this.options.levels,
      entryMetadataFields: this.options.entryMetadataFields
    });
    this.$el.html(rtpl);
    this.listenTo(Backbone, 'sortlevels:update', (function(_this) {
      return function(sortLevels) {
        var level, sortParameters, _i, _len;
        _this.options.levels = sortLevels;
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
    this.listenTo(Backbone, 'entrymetadatafields:update', (function(_this) {
      return function(fields) {
        _this.options.entryMetadataFields = fields;
        return _this.render();
      };
    })(this));
    levels = this.$('div.levels');
    leave = function(ev) {
      if (!(el(levels[0]).hasDescendant(ev.target) || levels[0] === ev.target)) {
        return levels.hide();
      }
    };
    this.onMouseleave = leave.bind(this);
    return levels.on('mouseleave', this.onMouseleave);
  };

  SortLevels.prototype.events = function() {
    return {
      'click button.toggle': 'toggleLevels',
      'click li.search button': 'saveLevels',
      'change div.levels select': 'changeLevels',
      'click div.levels i.fa': 'changeAlphaSort'
    };
  };

  SortLevels.prototype.toggleLevels = function(ev) {
    return this.$('div.levels').toggle();
  };

  SortLevels.prototype.hideLevels = function() {
    return this.$('div.levels').hide();
  };

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

  SortLevels.prototype.changeAlphaSort = function(ev) {
    var $target;
    this.$('div.levels').addClass('show-save-button');
    $target = this.$(ev.currentTarget);
    $target.toggleClass('fa-sort-alpha-asc');
    return $target.toggleClass('fa-sort-alpha-desc');
  };

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

  SortLevels.prototype.destroy = function() {
    this.$('div.levels').off('mouseleave', this.onMouseleave);
    return this.remove();
  };

  return SortLevels;

})(Backbone.View);

module.exports = SortLevels;



},{"./sort.jade":31,"funcky.el":1}],31:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (entryMetadataFields, levels) {
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

buf.push("<li class=\"search\">&nbsp;<button>Change levels</button></li></ul></div>");}("entryMetadataFields" in locals_for_with?locals_for_with.entryMetadataFields:typeof entryMetadataFields!=="undefined"?entryMetadataFields:undefined,"levels" in locals_for_with?locals_for_with.levels:typeof levels!=="undefined"?levels:undefined));;return buf.join("");
};
},{"jade/runtime":5}],32:[function(_dereq_,module,exports){
var Backbone, Models, TextSearch, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

Models = {
  Search: _dereq_('../models/search')
};

tpl = _dereq_('../../jade/text-search.jade');

TextSearch = (function(_super) {
  __extends(TextSearch, _super);

  function TextSearch() {
    return TextSearch.__super__.constructor.apply(this, arguments);
  }

  TextSearch.prototype.className = 'text-search';

  TextSearch.prototype.initialize = function(options) {
    this.config = options.config;
    return this.reset();
  };

  TextSearch.prototype.setModel = function() {
    if (this.model != null) {
      this.stopListening(this.model);
    }
    return this.model = new Models.Search(this.config.get('textSearchOptions'));
  };

  TextSearch.prototype.render = function() {
    if (this.config.get('templates').hasOwnProperty('text-search')) {
      tpl = this.config.get('templates')['text-search'];
    }
    this.$el.html(tpl({
      model: this.model
    }));
    return this;
  };

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
      'change input[type="checkbox"]': 'checkboxChanged'
    };
  };

  TextSearch.prototype.onKeyUp = function(ev) {
    if (ev.keyCode === 13) {
      ev.preventDefault();
      return this.search(ev);
    }
    if (this.model.get('term') !== ev.currentTarget.value) {
      this.model.set({
        term: ev.currentTarget.value
      });
      return this.updateQueryModel();
    }
  };

  TextSearch.prototype.checkboxChanged = function(ev) {
    var attr, cb, checkedArray, _i, _len, _ref;
    if (attr = ev.currentTarget.getAttribute('data-attr')) {
      if (attr === 'searchInTranscriptions') {
        this.$('ul.textlayers').toggle(ev.currentTarget.checked);
      }
      this.model.set(attr, ev.currentTarget.checked);
    } else if (attr = ev.currentTarget.getAttribute('data-attr-array')) {
      checkedArray = [];
      _ref = this.el.querySelectorAll('[data-attr-array="' + attr + '"]');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cb = _ref[_i];
        if (cb.checked) {
          checkedArray.push(cb.getAttribute('data-value'));
        }
      }
      this.model.set(attr, checkedArray);
    }
    return this.updateQueryModel();
  };

  TextSearch.prototype.search = function(ev) {
    ev.preventDefault();
    return this.trigger('search');
  };

  TextSearch.prototype.updateQueryModel = function() {
    return this.trigger('change', this.model.queryData());
  };

  TextSearch.prototype.reset = function() {
    this.setModel();
    return this.render();
  };

  TextSearch.prototype.destroy = function() {
    return this.remove();
  };

  return TextSearch;

})(Backbone.View);

module.exports = TextSearch;



},{"../../jade/text-search.jade":41,"../models/search":17}],33:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (options, ucfirst) {
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

buf.push("</ul>");}("options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"ucfirst" in locals_for_with?locals_for_with.ucfirst:typeof ucfirst!=="undefined"?ucfirst:undefined));;return buf.join("");
};
},{"jade/runtime":5}],34:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, title, options) {
buf.push("<header><h3" + (jade.attr("data-name", name, true, false)) + ">" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h3></header><div class=\"body\"><label>From:</label><select>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade_interp = option) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade_interp = option) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><label>To:</label><select>");
// iterate options.reverse()
;(function(){
  var $$obj = options.reverse();
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade_interp = option) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade_interp = option) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");}("name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined));;return buf.join("");
};
},{"jade/runtime":5}],35:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<ul></ul>");;return buf.join("");
};
},{"jade/runtime":5}],36:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<input type=\"checkbox\" name=\"all\"/><input type=\"text\" name=\"filter\"/><small class=\"optioncount\"></small>");;return buf.join("");
};
},{"jade/runtime":5}],37:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (option) {
buf.push("<li" + (jade.attr("data-count", option.get('count'), true, false)) + (jade.attr("data-value", option.id, true, false)) + "><i" + (jade.attr("data-value", option.id, true, false)) + (jade.cls(['unchecked','fa','fa-square-o',option.get('checked')?'hidden':'visible'], [null,null,null,true])) + "></i><i" + (jade.attr("data-value", option.id, true, false)) + (jade.cls(['checked','fa','fa-check-square-o',option.get('checked')?'visible':'hidden'], [null,null,null,true])) + "></i><label" + (jade.attr("data-value", option.id, true, false)) + ">" + (null == (jade_interp = option.id === ':empty' ? '<em>(empty)</em>' : option.id) ? "" : jade_interp) + "</label><div class=\"count\">" + (jade.escape(null == (jade_interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade_interp)) + "</div></li>");}("option" in locals_for_with?locals_for_with.option:typeof option!=="undefined"?option:undefined));;return buf.join("");
};
},{"jade/runtime":5}],38:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (title) {
buf.push("<div class=\"placeholder\"><header><h3>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h3><div class=\"menu\"><i title=\"Filter options\" class=\"filter fa fa-filter\"></i><i title=\"Sort alphabetically\" class=\"alpha fa fa-sort-alpha-asc\"></i><i title=\"Sort numerically\" class=\"amount active fa fa-sort-amount-desc\"></i></div><div class=\"options\"></div></header><div class=\"body\"></div></div>");}("title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
};
},{"jade/runtime":5}],39:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (options) {
buf.push("<div class=\"slider\"><span class=\"dash\">-</span><div class=\"handle-min handle\"><input" + (jade.attr("value", options.lowerLimit, true, false)) + " disabled=\"disabled\" class=\"min\"/></div><div class=\"handle-max handle\"><input" + (jade.attr("value", options.upperLimit, true, false)) + " disabled=\"disabled\" class=\"max\"/></div><div class=\"bar\">&nbsp;</div><button>Search?</button></div>");}("options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined));;return buf.join("");
};
},{"jade/runtime":5}],40:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"overlay\"><div><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div><div class=\"faceted-search\"><div class=\"text-search-placeholder\"></div><ul class=\"facets-menu\"><li class=\"reset\"><button><i class=\"fa fa-refresh\"></i><span>New search</span></button></li><li class=\"switch\"><button><i class=\"fa fa-angle-double-up\"></i><i class=\"fa fa-angle-double-down\"></i><span class=\"simple\">Simple search</span><span class=\"advanced\">Advanced search</span></button></li><li class=\"collapse-expand\"><button><i class=\"fa fa-compress\"></i><span>Collapse filters</span></button></li></ul><div class=\"facets-placeholder\"></div></div><div class=\"results\"></div>");;return buf.join("");
};
},{"jade/runtime":5}],41:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (model) {
buf.push("<div class=\"placeholder\"><div class=\"body\"><div class=\"search-input\"><input type=\"text\" name=\"search\"/><i class=\"fa fa-search\"></i></div><div class=\"menu\"><i class=\"fa fa-times\"></i><div class=\"row-1\"><div class=\"cell-1\"><input id=\"cb_casesensitive\" type=\"checkbox\" name=\"cb_casesensitive\" data-attr=\"caseSensitive\"/><label for=\"cb_casesensitive\">Match case</label></div><div class=\"cell-2\"><input id=\"cb_fuzzy\" type=\"checkbox\" name=\"cb_fuzzy\" data-attr=\"fuzzy\"/><label for=\"cb_fuzzy\">Fuzzy</label></div></div><div class=\"row-2\">");
if ( model.has('searchInAnnotations') || model.has('searchInTranscriptions'))
{
buf.push("<div class=\"cell-1\"><h4>Search in:</h4><ul class=\"searchins\">");
if ( model.has('searchInTranscriptions'))
{
buf.push("<li class=\"searchin\"><input id=\"cb_searchin_transcriptions\" type=\"checkbox\" data-attr=\"searchInTranscriptions\"" + (jade.attr("checked", model.get('searchInTranscriptions'), true, false)) + "/><label for=\"cb_searchin_transcriptions\">Transcriptions</label></li>");
}
if ( model.has('searchInAnnotations'))
{
buf.push("<li class=\"searchin\"><input id=\"cb_searchin_annotations\" type=\"checkbox\" data-attr=\"searchInAnnotations\"" + (jade.attr("checked", model.get('searchInAnnotations'), true, false)) + "/><label for=\"cb_searchin_annotations\">Annotations</label></li>");
}
buf.push("</ul></div>");
}
if ( model.has('textLayers') && model.get('textLayers').length > 1)
{
buf.push("<div class=\"cell-1\"><h4>Textlayers:</h4><ul class=\"textlayers\">");
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

buf.push("</ul></div>");
}
buf.push("</div></div></div></div>");}("model" in locals_for_with?locals_for_with.model:typeof model!=="undefined"?model:undefined));;return buf.join("");
};
},{"jade/runtime":5}]},{},[9])
(9)
});