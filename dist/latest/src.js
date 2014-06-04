!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FacetedSearch=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var $, defaultOptions, token;

$ = _dereq_('jquery');

token = _dereq_('./token');

defaultOptions = {
  token: true
};

module.exports = {
  get: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('get', args, options);
  },
  post: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('post', args, options);
  },
  put: function(args, options) {
    if (options == null) {
      options = {};
    }
    return this.fire('put', args, options);
  },
  poll: function(args) {
    var done, dopoll, testFn, url;
    url = args.url, testFn = args.testFn, done = args.done;
    dopoll = (function(_this) {
      return function() {
        var xhr;
        xhr = _this.get({
          url: url
        });
        return xhr.done(function(data, textStatus, jqXHR) {
          if (testFn(data)) {
            return done(data, textStatus, jqXHR);
          } else {
            return setTimeout(dopoll, 5000);
          }
        });
      };
    })(this);
    return dopoll();
  },
  fire: function(type, args, options) {
    var ajaxArgs;
    options = $.extend({}, defaultOptions, options);
    ajaxArgs = {
      type: type,
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      processData: false,
      crossDomain: true
    };
    if (options.token && (token.get() != null)) {
      ajaxArgs.beforeSend = (function(_this) {
        return function(xhr) {
          return xhr.setRequestHeader('Authorization', "" + (token.getType()) + " " + (token.get()));
        };
      })(this);
    } else {
      ajaxArgs.beforeSend = (function(_this) {
        return function(xhr) {};
      })(this);
    }
    return $.ajax($.extend(ajaxArgs, args));
  }
};


},{"./token":2,"jquery":"D1nrrK"}],2:[function(_dereq_,module,exports){
var Token;

Token = (function() {
  function Token() {}

  Token.prototype.token = null;

  Token.prototype.set = function(token, type) {
    this.token = token;
    if (type == null) {
      type = 'SimpleAuth';
    }
    sessionStorage.setItem('huygens_token_type', type);
    return sessionStorage.setItem('huygens_token', this.token);
  };

  Token.prototype.getType = function() {
    return sessionStorage.getItem('huygens_token_type');
  };

  Token.prototype.get = function() {
    if (this.token == null) {
      this.token = sessionStorage.getItem('huygens_token');
    }
    return this.token;
  };

  Token.prototype.clear = function() {
    sessionStorage.removeItem('huygens_token');
    return sessionStorage.removeItem('huygens_token_type');
  };

  return Token;

})();

module.exports = new Token();


},{}],3:[function(_dereq_,module,exports){
var Backbone;

Backbone = _dereq_('backbone');

module.exports = {
  subscribe: function(ev, done) {
    return this.listenTo(Backbone, ev, done);
  },
  publish: function() {
    return Backbone.trigger.apply(Backbone, arguments);
  }
};


},{"backbone":"j6c3vP"}],4:[function(_dereq_,module,exports){
var DOM, _;

_ = _dereq_('underscore');

DOM = function(el) {
  if (_.isString(el)) {
    el = document.querySelector(el);
  }
  return {
    el: el,
    q: function(query) {
      return DOM(query);
    },
    find: function(query) {
      return DOM(query);
    },
    findAll: function(query) {
      return DOM(el.querySelectorAll(query));
    },
    html: function(html) {
      if (html == null) {
        return el.innerHTML;
      }
      if (html.nodeType === 1 || html.nodeType === 11) {
        el.innerHTML = '';
        return el.appendChild(html);
      } else {
        return el.innerHTML = html;
      }
    },
    hide: function() {
      el.style.display = 'none';
      return this;
    },
    show: function(displayType) {
      if (displayType == null) {
        displayType = 'block';
      }
      el.style.display = displayType;
      return this;
    },
    toggle: function(displayType, show) {
      var dt;
      if (displayType == null) {
        displayType = 'block';
      }
      dt = el.style.display === displayType ? 'none' : displayType;
      if (show != null) {
        dt = show ? displayType : 'none';
      }
      el.style.display = dt;
      return this;
    },
    closest: function(selector) {
      var matchesSelector;
      matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
      while (el) {
        if (matchesSelector.bind(el)(selector)) {
          return el;
        } else {
          el = el.parentNode;
        }
      }
    },
    append: function(childEl) {
      return el.appendChild(childEl);
    },
    prepend: function(childEl) {
      return el.insertBefore(childEl, el.firstChild);
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
    boundingBox: function() {
      var box;
      box = this.position();
      box.width = el.clientWidth;
      box.height = el.clientHeight;
      box.right = box.left + box.width;
      box.bottom = box.top + box.height;
      return box;
    },
    insertAfter: function(referenceElement) {
      return referenceElement.parentNode.insertBefore(el, referenceElement.nextSibling);
    },
    highlightUntil: function(endNode, options) {
      if (options == null) {
        options = {};
      }
      if (options.highlightClass == null) {
        options.highlightClass = 'highlight';
      }
      if (options.tagName == null) {
        options.tagName = 'span';
      }
      return {
        on: function() {
          var filter, newNode, range, range2, treewalker;
          range = document.createRange();
          range.setStartAfter(el);
          range.setEndBefore(endNode);
          filter = (function(_this) {
            return function(node) {
              var end, r, start;
              r = document.createRange();
              r.selectNode(node);
              start = r.compareBoundaryPoints(Range.START_TO_START, range);
              end = r.compareBoundaryPoints(Range.END_TO_START, range);
              if (start === -1 || end === 1) {
                return NodeFilter.FILTER_SKIP;
              } else {
                return NodeFilter.FILTER_ACCEPT;
              }
            };
          })(this);
          filter.acceptNode = filter;
          treewalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, filter, false);
          while (treewalker.nextNode()) {
            range2 = new Range();
            range2.selectNode(treewalker.currentNode);
            newNode = document.createElement(options.tagName);
            newNode.className = options.highlightClass;
            range2.surroundContents(newNode);
          }
          return this;
        },
        off: function() {
          var _i, _len, _ref, _results;
          _ref = document.querySelectorAll('.' + options.highlightClass);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            el = _ref[_i];
            el.parentElement.insertBefore(el.firstChild, el);
            _results.push(el.parentElement.removeChild(el));
          }
          return _results;
        }
      };
    },
    hasClass: function(name) {
      return (' ' + el.className + ' ').indexOf(' ' + name + ' ') > -1;
    },
    addClass: function(name) {
      if (!this.hasClass(name)) {
        return el.className += ' ' + name;
      }
    },
    removeClass: function(name) {
      var names;
      names = ' ' + el.className + ' ';
      names = names.replace(' ' + name + ' ', '');
      return el.className = names.replace(/^\s+|\s+$/g, '');
    },
    toggleClass: function(name) {
      if (this.hasClass(name)) {
        return this.addClass(name);
      } else {
        return this.removeClass(name);
      }
    },
    inViewport: function(parent) {
      var doc, rect, win;
      win = parent != null ? parent : window;
      doc = parent != null ? parent : document.documentElement;
      rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (win.innerHeight || doc.clientHeight) && rect.right <= (win.innerWidth || doc.clientWidth);
    },
    createTreeWalker: function(endNode, nodeFilterConstant) {
      var filter, range;
      if (nodeFilterConstant == null) {
        nodeFilterConstant = NodeFilter.SHOW_ELEMENT;
      }
      range = document.createRange();
      range.setStartAfter(el);
      range.setEndBefore(endNode);
      filter = (function(_this) {
        return function(node) {
          var end, r, start;
          r = document.createRange();
          r.selectNode(node);
          start = r.compareBoundaryPoints(Range.START_TO_START, range);
          end = r.compareBoundaryPoints(Range.END_TO_START, range);
          if (start === -1 || end === 1) {
            return NodeFilter.FILTER_SKIP;
          } else {
            return NodeFilter.FILTER_ACCEPT;
          }
        };
      })(this);
      filter.acceptNode = filter;
      return document.createTreeWalker(range.commonAncestorContainer, nodeFilterConstant, filter, false);
    }
  };
};

module.exports = DOM;


},{"underscore":"lkcZM4"}],5:[function(_dereq_,module,exports){
var $, _,
  __hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');

_ = _dereq_('underscore');

module.exports = {
  closest: function(el, selector) {
    var matchesSelector;
    matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.bind(el)(selector)) {
        return el;
      } else {
        el = el.parentNode;
      }
    }
  },

  /*
  	Generates an ID that starts with a letter
  	
  	Example: "aBc12D34"
  
  	param Number length of the id
  	return String
   */
  generateID: function(length) {
    var chars, text;
    length = (length != null) && length > 0 ? length - 1 : 7;
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    text = chars.charAt(Math.floor(Math.random() * 52));
    while (length--) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  },

  /*
  	Deepcopies arrays and object literals
  	
  	return Array or object
   */
  deepCopy: function(object) {
    var newEmpty;
    newEmpty = Array.isArray(object) ? [] : {};
    return $.extend(true, newEmpty, object);
  },
  timeoutWithReset: (function() {
    var timer;
    timer = null;
    return function(ms, cb, onResetFn) {
      if (timer != null) {
        if (onResetFn != null) {
          onResetFn();
        }
        clearTimeout(timer);
      }
      return timer = setTimeout((function() {
        timer = null;
        return cb();
      }), ms);
    };
  })(),

  /*
  	Highlight text between two nodes. 
  
  	Creates a span.hilite between two given nodes, surrounding the contents of the nodes
  
  	Example usage:
  	hl = Fn.highlighter
  		className: 'highlight' # optional
  		tagName: 'div' # optional
  
  	supEnter = (ev) -> hl.on
  		startNode: el.querySelector(#someid) # required
  		endNode: ev.currentTarget # required
  	supLeave = -> hl.off()
  	$(sup).hover supEnter, supLeave
   */
  highlighter: function(args) {
    var className, el, tagName;
    if (args == null) {
      args = {};
    }
    className = args.className, tagName = args.tagName;
    if (className == null) {
      className = 'hilite';
    }
    if (tagName == null) {
      tagName = 'span';
    }
    el = null;
    return {
      on: function(args) {
        var endNode, range, startNode;
        startNode = args.startNode, endNode = args.endNode;
        range = document.createRange();
        range.setStartAfter(startNode);
        range.setEndBefore(endNode);
        el = document.createElement(tagName);
        el.className = className;
        el.appendChild(range.extractContents());
        return range.insertNode(el);
      },
      off: function() {
        return $(el).replaceWith(function() {
          return $(this).contents();
        });
      }
    };
  },

  /*
  	Native alternative to jQuery's $.offset()
  
  	http://www.quirksmode.org/js/findpos.html
   */
  position: function(el, parent) {
    var left, top;
    left = 0;
    top = 0;
    while (el !== parent) {
      left += el.offsetLeft;
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return {
      left: left,
      top: top
    };
  },
  boundingBox: function(el) {
    var box;
    box = $(el).offset();
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
  isDescendant: function(parent, child) {
    var node;
    node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  },

  /*
  	Removes an item from an array
   */
  removeFromArray: function(arr, item) {
    var index;
    index = arr.indexOf(item);
    arr.splice(index, 1);
    return arr;
  },

  /* Escape a regular expression */
  escapeRegExp: function(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  /*
  	Flattens an object
  
  	songs:
  		mary:
  			had:
  				little: 'lamb'
  
  	becomes
  
  	songs:
  		mary.had.little: 'lamb'
  
  	Taken from: http://thedersen.com/projects/backbone-validation
   */
  flattenObject: function(obj, into, prefix) {
    var k, v;
    if (into == null) {
      into = {};
    }
    if (prefix == null) {
      prefix = '';
    }
    for (k in obj) {
      if (!__hasProp.call(obj, k)) continue;
      v = obj[k];
      if (_.isObject(v) && !_.isArray(v) && !_.isFunction(v) && !(v instanceof Backbone.Model) && !(v instanceof Backbone.Collection)) {
        this.flattenObject(v, into, prefix + k + '.');
      } else {
        into[prefix + k] = v;
      }
    }
    return into;
  },
  compareJSON: function(current, changed) {
    var attr, changes, value;
    changes = {};
    for (attr in current) {
      if (!__hasProp.call(current, attr)) continue;
      value = current[attr];
      if (!changed.hasOwnProperty(attr)) {
        changes[attr] = 'removed';
      }
    }
    for (attr in changed) {
      if (!__hasProp.call(changed, attr)) continue;
      value = changed[attr];
      if (current.hasOwnProperty(attr)) {
        if (_.isArray(value) || this.isObjectLiteral(value)) {
          if (!_.isEqual(current[attr], changed[attr])) {
            changes[attr] = changed[attr];
          }
        } else {
          if (current[attr] !== changed[attr]) {
            changes[attr] = changed[attr];
          }
        }
      } else {
        changes[attr] = 'added';
      }
    }
    return changes;
  },
  isObjectLiteral: function(obj) {
    var ObjProto;
    if ((obj == null) || typeof obj !== "object") {
      return false;
    }
    ObjProto = obj;
    while (Object.getPrototypeOf(ObjProto = Object.getPrototypeOf(ObjProto)) !== null) {
      0;
    }
    return Object.getPrototypeOf(obj) === ObjProto;
  },
  getScrollPercentage: function(el) {
    var left, scrolledLeft, scrolledTop, top, totalLeft, totalTop;
    scrolledTop = el.scrollTop;
    totalTop = el.scrollHeight - el.clientHeight;
    scrolledLeft = el.scrollLeft;
    totalLeft = el.scrollWidth - el.clientWidth;
    top = totalTop === 0 ? 0 : Math.floor((scrolledTop / totalTop) * 100);
    left = totalLeft === 0 ? 0 : Math.floor((scrolledLeft / totalLeft) * 100);
    return {
      top: top,
      left: left
    };
  },
  setScrollPercentage: function(el, percentages) {
    if (percentages.top < 5) {
      percentages.top = 0;
    }
    if (percentages.top > 95) {
      percentages.top = 100;
    }
    el.scrollTop = (el.scrollHeight - el.clientHeight) * percentages.top / 100;
    return el.scrollLeft = (el.scrollWidth - el.clientWidth) * percentages.left / 100;
  },
  checkCheckboxes: function(selector, checked, baseEl) {
    var cb, checkboxes, _i, _len, _results;
    if (selector == null) {
      selector = 'input[type="checkbox"]';
    }
    if (checked == null) {
      checked = true;
    }
    if (baseEl == null) {
      baseEl = document;
    }
    checkboxes = baseEl.querySelectorAll(selector);
    _results = [];
    for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
      cb = checkboxes[_i];
      _results.push(cb.checked = checked);
    }
    return _results;
  },
  setCursorToEnd: function(textEl, windowEl) {
    var range, sel, win;
    win = windowEl != null ? windowEl : window;
    if (windowEl == null) {
      windowEl = textEl;
    }
    windowEl.focus();
    range = document.createRange();
    range.selectNodeContents(textEl);
    range.collapse(false);
    sel = win.getSelection();
    if (sel != null) {
      sel.removeAllRanges();
      return sel.addRange(range);
    }
  },
  arraySum: function(arr) {
    if (arr.length === 0) {
      return 0;
    }
    return arr.reduce(function(prev, current) {
      return current + prev;
    });
  },
  getAspectRatio: function(originalWidth, originalHeight, boxWidth, boxHeight) {
    var heightRatio, widthRatio;
    widthRatio = boxWidth / originalWidth;
    heightRatio = boxHeight / originalHeight;
    return Math.min(widthRatio, heightRatio);
  },
  hasScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  },
  hasXScrollBar: function(el) {
    return el.scrollWidth > el.clientWidth;
  },
  hasYScrollBar: function(el) {
    return el.scrollHeight > el.clientHeight;
  }
};


},{"jquery":"D1nrrK","underscore":"lkcZM4"}],6:[function(_dereq_,module,exports){
var $;

$ = _dereq_('jquery');

module.exports = {
  ucfirst: function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /*
  	Slugify a string
   */
  slugify: function(str) {
    var from, index, strlen, to;
    from = "àáäâèéëêìíïîòóöôùúüûñç·/_:;";
    to = "aaaaeeeeiiiioooouuuunc-----";
    str = str.trim().toLowerCase();
    strlen = str.length;
    while (strlen--) {
      index = from.indexOf(str[strlen]);
      if (index !== -1) {
        str = str.substr(0, strlen) + to[index] + str.substr(strlen + 1);
      }
    }
    return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+|\-+/g, '-').replace(/^\-+|\-+$/g, '');
  },

  /*
  	Strips the tags from a string
  	
  	Example: "This is a <b>string</b>." => "This is a string."
  	
  	return String
   */
  stripTags: function(str) {
    return $('<span />').html(str).text();
  },

  /*
  	Removes non numbers from a string
  	
  	Example: "Count the 12 monkeys." => "12"
  	
  	return String
   */
  onlyNumbers: function(str) {
    return str.replace(/[^\d.]/g, '');
  },
  hashCode: function(str) {
    var c, chr, hash, i, _i, _len;
    if (str.length === 0) {
      return false;
    }
    hash = 0;
    for (i = _i = 0, _len = str.length; _i < _len; i = ++_i) {
      chr = str[i];
      c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash = hash & hash;
    }
    return hash;
  },
  insertAt: function(str, needle, index) {
    return str.slice(0, index) + needle + str.slice(index);
  }
};


},{"jquery":"D1nrrK"}],7:[function(_dereq_,module,exports){
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
},{}],8:[function(_dereq_,module,exports){
var Backbone, ListOptions, Models, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

Models = {
  Option: _dereq_('../models/list.option')
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
    this.each((function(_this) {
      return function(option) {
        return option.set('checked', false, {
          silent: true
        });
      };
    })(this));
    return this.trigger('change');
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
      return +(!model.get('visible')) + +(!!model.get('count')) + model.get('name');
    },
    alpha_desc: function(model) {
      var str;
      str = String.fromCharCode.apply(String, _.map(model.get('name').split(''), function(c) {
        return 0xffff - c.charCodeAt();
      }));
      return +(!model.get('visible')) + +(!!model.get('count')) + str;
    },
    amount_asc: function(model) {
      var add;
      add = model.get('visible') ? 0 : 10000000;
      return add + +model.get('count');
    },
    amount_desc: function(model) {
      var add;
      add = model.get('visible') ? -10000000 : 0;
      return add + (-1 * +model.get('count'));
    }
  };

  ListOptions.prototype.orderBy = function(strategy) {
    this.comparator = this.strategies[strategy];
    return this.sort();
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


},{"../models/list.option":16,"backbone":"j6c3vP","underscore":"lkcZM4"}],9:[function(_dereq_,module,exports){
var Backbone, SearchResult, SearchResults, ajax, config, pubsub, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

pubsub = _dereq_('hilib/src/mixins/pubsub');

SearchResult = _dereq_('../models/searchresult');

ajax = _dereq_('hilib/src/managers/ajax');

config = _dereq_('../config');

SearchResults = (function(_super) {
  __extends(SearchResults, _super);

  function SearchResults() {
    return SearchResults.__super__.constructor.apply(this, arguments);
  }

  SearchResults.prototype.model = SearchResult;

  SearchResults.prototype.initialize = function() {
    _.extend(this, pubsub);
    this.cachedModels = {};
    this.queryAmount = 0;
    return this.on('add', this.setCurrent, this);
  };

  SearchResults.prototype.clearCache = function() {
    return this.cachedModels = {};
  };

  SearchResults.prototype.setCurrent = function(current) {
    var changeMessage, _ref;
    this.current = current;
    changeMessage = ((_ref = this.current.options) != null ? _ref.url : void 0) != null ? 'change:cursor' : 'change:results';
    return this.trigger(changeMessage, this.current);
  };

  SearchResults.prototype.runQuery = function(queryOptions, options) {
    var queryOptionsString, resultRows;
    if (options == null) {
      options = {};
    }
    if (options.cache == null) {
      options.cache = true;
    }
    this.queryAmount += 1;
    if (queryOptions.hasOwnProperty('resultRows')) {
      resultRows = queryOptions.resultRows;
      delete queryOptions.resultRows;
    }
    queryOptionsString = JSON.stringify(queryOptions);
    if (options.cache && this.cachedModels.hasOwnProperty(queryOptionsString)) {
      return this.setCurrent(this.cachedModels[queryOptionsString]);
    } else {
      return this.postQuery(queryOptions, (function(_this) {
        return function(url) {
          return _this.getResults(url, function(response) {
            return _this.addModel(response, queryOptionsString);
          });
        };
      })(this));
    }
  };

  SearchResults.prototype.addModel = function(attrs, cacheId) {
    this.cachedModels[cacheId] = new this.model(attrs);
    return this.add(this.cachedModels[cacheId]);
  };

  SearchResults.prototype.moveCursor = function(direction) {
    var url;
    url = direction === '_prev' || direction === '_next' ? this.current.get(direction) : direction;
    if (url != null) {
      if (this.cachedModels.hasOwnProperty(url)) {
        return this.setCurrent(this.cachedModels[url]);
      } else {
        return this.getResults(url, (function(_this) {
          return function(response) {
            return _this.addModel(response, url);
          };
        })(this));
      }
    }
  };

  SearchResults.prototype.page = function(pagenumber, database) {
    var start, url;
    start = config.resultRows * (pagenumber - 1);
    url = this.postURL + ("?rows=" + config.resultRows + "&start=" + start);
    if (database != null) {
      url += "&database=" + database;
    }
    return this.getResults(url, (function(_this) {
      return function(attrs) {
        return _this.trigger('change:page', new _this.model(attrs), database);
      };
    })(this));
  };

  SearchResults.prototype.postQuery = function(queryOptions, done) {
    var ajaxOptions, jqXHR;
    this.trigger('request');
    ajaxOptions = {
      url: config.baseUrl + config.searchPath,
      data: JSON.stringify(queryOptions),
      dataType: 'text'
    };
    if (config.hasOwnProperty('requestOptions')) {
      _.extend(ajaxOptions, config.requestOptions);
    }
    jqXHR = ajax.post(ajaxOptions);
    jqXHR.done((function(_this) {
      return function(data, textStatus, jqXHR) {
        var url;
        if (jqXHR.status === 201) {
          _this.postURL = jqXHR.getResponseHeader('Location');
          url = config.resultRows != null ? _this.postURL + '?rows=' + config.resultRows : _this.postURL;
          return done(url);
        }
      };
    })(this));
    return jqXHR.fail((function(_this) {
      return function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          _this.trigger('unauthorized');
        }
        return console.error('Failed posting FacetedSearch queryOptions to the server!', arguments);
      };
    })(this));
  };

  SearchResults.prototype.getResults = function(url, done) {
    var jqXHR;
    this.trigger('request');
    jqXHR = ajax.get({
      url: url
    });
    jqXHR.done((function(_this) {
      return function(data, textStatus, jqXHR) {
        done(data);
        return _this.trigger('sync');
      };
    })(this));
    return jqXHR.fail((function(_this) {
      return function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
          _this.trigger('unauthorized');
        }
        return console.error('Failed getting FacetedSearch results from the server!', arguments);
      };
    })(this));
  };

  return SearchResults;

})(Backbone.Collection);

module.exports = SearchResults;


},{"../config":10,"../models/searchresult":20,"backbone":"j6c3vP","hilib/src/managers/ajax":1,"hilib/src/mixins/pubsub":3,"underscore":"lkcZM4"}],10:[function(_dereq_,module,exports){
module.exports = {
  resultRows: null,
  baseUrl: '',
  searchPath: '',
  textSearch: 'advanced',
  token: null,
  queryOptions: {},
  facetTitleMap: {},
  templates: {},
  autoSearch: true
};


},{}],11:[function(_dereq_,module,exports){
var $, Backbone, Fn, MainView, QueryOptions, SearchResults, Views, config, dom, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

Backbone.$ = $;

_ = _dereq_('underscore');

Fn = _dereq_('hilib/src/utils/general');

dom = _dereq_('hilib/src/utils/dom');

config = _dereq_('./config');

QueryOptions = _dereq_('./models/query-options');

SearchResults = _dereq_('./collections/searchresults');

Views = {
  TextSearch: _dereq_('./views/text-search'),
  Facets: _dereq_('./views/facets')
};

tpl = _dereq_('../jade/main.jade');

MainView = (function(_super) {
  __extends(MainView, _super);

  function MainView() {
    return MainView.__super__.constructor.apply(this, arguments);
  }

  MainView.prototype.initialize = function(options) {
    var facetViewMap;
    if (options == null) {
      options = {};
    }
    if (options.facetViewMap != null) {
      facetViewMap = _.clone(options.facetViewMap);
      delete options.facetViewMap;
    }
    this.extendConfig(options);
    this.instantiateQueryOptions();
    this.instantiateSearchResults();
    this.instantiateFacets(facetViewMap);
    this.render();
    if (config.development) {
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
    this.$el.html(tpl());
    if (config.templates.hasOwnProperty('main')) {
      this.$('form').html(config.templates.main());
    }
    this.$('.faceted-search').addClass("search-type-" + config.textSearch);
    if (config.textSearch === 'simple' || config.textSearch === 'advanced') {
      this.renderTextSearch();
    }
    this.$('.facets').html(this.facets.el);
    setTimeout(this.postRender.bind(this), 0);
    return this;
  };

  MainView.prototype.postRender = function() {
    if (config.textSearch !== 'simple') {
      return this.search();
    }
  };

  MainView.prototype.renderTextSearch = function() {
    this.textSearch = new Views.TextSearch();
    this.$('.text-search-placeholder').html(this.textSearch.el);
    this.listenTo(this.textSearch, 'change', (function(_this) {
      return function(queryOptions) {
        return _this.queryOptions.set(queryOptions, {
          silent: true
        });
      };
    })(this));
    return this.listenTo(this.textSearch, 'search', this.search);
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
    ev.preventDefault();
    config.textSearch = config.textSearch === 'advanced' ? 'simple' : 'advanced';
    this.$('.faceted-search').toggleClass('search-type-simple');
    this.$('.faceted-search').toggleClass('search-type-advanced');
    if (this.searchResults.length === 0) {
      return this.search();
    } else {
      return this.update();
    }
  };

  MainView.prototype.onReset = function(ev) {
    ev.preventDefault();
    return this.reset();
  };

  MainView.prototype.destroy = function() {
    this.facets.destroy();
    this.textSearch.destroy();
    return this.remove();
  };

  MainView.prototype.extendConfig = function(options) {
    _.extend(config.facetTitleMap, options.facetTitleMap);
    delete options.facetTitleMap;
    _.extend(config, options);
    if (['none', 'simple', 'advanced'].indexOf(config.textSearch) === -1) {
      return config.textSearch = 'advanced';
    }
  };

  MainView.prototype.instantiateQueryOptions = function() {
    var attrs;
    attrs = _.extend(config.queryOptions, config.textSearchOptions);
    this.queryOptions = new QueryOptions(attrs);
    if (config.autoSearch) {
      return this.listenTo(this.queryOptions, 'change', this.search);
    }
  };

  MainView.prototype.instantiateSearchResults = function() {
    this.searchResults = new SearchResults();
    this.listenTo(this.searchResults, 'change:results', (function(_this) {
      return function(responseModel) {
        if (config.textSearch !== 'simple') {
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
    this.listenTo(this.searchResults, 'request', this.showLoader);
    this.listenTo(this.searchResults, 'sync', this.hideLoader);
    return this.listenTo(this.searchResults, 'unauthorized', (function(_this) {
      return function() {
        return _this.trigger('unauthorized');
      };
    })(this));
  };

  MainView.prototype.instantiateFacets = function(viewMap) {
    if (viewMap == null) {
      viewMap = {};
    }
    this.facets = new Views.Facets({
      viewMap: viewMap
    });
    return this.listenTo(this.facets, 'change', this.queryOptions.set.bind(this.queryOptions));
  };

  MainView.prototype.showLoader = function() {
    var facetedSearch, fsBox, left, loader, overlay, top;
    overlay = this.el.querySelector('.overlay');
    if (overlay.style.display === 'block') {
      return;
    }
    loader = overlay.children[0];
    facetedSearch = this.el.querySelector('.faceted-search');
    fsBox = dom(facetedSearch).boundingBox();
    overlay.style.width = fsBox.width + 'px';
    overlay.style.height = fsBox.height + 'px';
    overlay.style.display = 'block';
    left = fsBox.left + fsBox.width / 2 - 12;
    loader.style.left = left + 'px';
    top = fsBox.top + fsBox.height / 2 - 12;
    if (fsBox.height > window.innerHeight) {
      top = '50vh';
    }
    return loader.style.top = top + 'px';
  };

  MainView.prototype.hideLoader = function() {
    return this.el.querySelector('.overlay').style.display = 'none';
  };

  MainView.prototype.update = function() {
    if (this.searchResults.queryAmount === 1) {
      return this.facets.render(this.el, this.searchResults.current.get('facets'));
    } else {
      return this.facets.update(this.searchResults.current.get('facets'));
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
    return this.searchResults.current.has('_next');
  };

  MainView.prototype.hasPrev = function() {
    return this.searchResults.current.has('_prev');
  };

  MainView.prototype.sortResultsBy = function(field) {
    return this.queryOptions.set({
      sort: field
    });
  };

  MainView.prototype.reset = function(cache) {
    if (cache == null) {
      cache = false;
    }
    if (this.textSearch != null) {
      this.textSearch.reset();
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
    if (options == null) {
      options = {};
    }
    options = _.extend({
      wait: true
    }, options);
    return this.searchResults.runQuery(this.queryOptions.attributes, options);
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;


},{"../jade/main.jade":37,"./collections/searchresults":9,"./config":10,"./models/query-options":17,"./views/facets":21,"./views/text-search":28,"backbone":"j6c3vP","hilib/src/utils/dom":4,"hilib/src/utils/general":5,"jquery":"D1nrrK","underscore":"lkcZM4"}],12:[function(_dereq_,module,exports){
var BooleanFacet, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./facet')
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


},{"./facet":14}],13:[function(_dereq_,module,exports){
var DateFacet, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('../models/facet')
};

DateFacet = (function(_super) {
  __extends(DateFacet, _super);

  function DateFacet() {
    return DateFacet.__super__.constructor.apply(this, arguments);
  }

  DateFacet.prototype.parse = function(attrs) {
    attrs.options = _.map(_.pluck(attrs.options, 'name'), function(option) {
      return option.substr(0, 4);
    });
    attrs.options = _.unique(attrs.options);
    attrs.options.sort();
    return attrs;
  };

  return DateFacet;

})(Models.Facet);

module.exports = DateFacet;


},{"../models/facet":14}],14:[function(_dereq_,module,exports){
var Backbone, Facet, config,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

config = _dereq_('../config');

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.idAttribute = 'name';

  Facet.prototype.parse = function(attrs) {
    if (config.facetTitleMap.hasOwnProperty(attrs.name)) {
      attrs.title = config.facetTitleMap[attrs.name];
    } else {
      config.facetTitleMap[attrs.name] = attrs.title;
    }
    return attrs;
  };

  return Facet;

})(Backbone.Model);

module.exports = Facet;


},{"../config":10,"backbone":"j6c3vP"}],15:[function(_dereq_,module,exports){
var List, Models,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Models = {
  Facet: _dereq_('./facet')
};

List = (function(_super) {
  __extends(List, _super);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  return List;

})(Models.Facet);

module.exports = List;


},{"./facet":14}],16:[function(_dereq_,module,exports){
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


},{"backbone":"j6c3vP"}],17:[function(_dereq_,module,exports){
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

  QueryOptions.prototype.defaults = function() {
    return {
      facetValues: [],
      sortParameters: []
    };
  };

  QueryOptions.prototype.initialize = function(initialAttributes, options) {
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


},{"../config":10,"backbone":"j6c3vP","underscore":"lkcZM4"}],18:[function(_dereq_,module,exports){
var FacetModel, RangeFacet,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

FacetModel = _dereq_('../models/facet');

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.parse = function(attrs) {
    RangeFacet.__super__.parse.apply(this, arguments);
    attrs.options = {
      lowerLimit: +((attrs.options[0].lowerLimit + '').substr(0, 4)),
      upperLimit: +((attrs.options[0].upperLimit + '').substr(0, 4))
    };
    return attrs;
  };

  return RangeFacet;

})(FacetModel);

module.exports = RangeFacet;


},{"../models/facet":14}],19:[function(_dereq_,module,exports){
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


},{"backbone":"j6c3vP","underscore":"lkcZM4"}],20:[function(_dereq_,module,exports){
var Backbone, SearchResult, ajax, config, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

ajax = _dereq_('hilib/src/managers/ajax');

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
      term: ''
    };
  };

  return SearchResult;

})(Backbone.Model);

module.exports = SearchResult;


},{"../config":10,"backbone":"j6c3vP","hilib/src/managers/ajax":1,"underscore":"lkcZM4"}],21:[function(_dereq_,module,exports){
var Backbone, Facets, config, viewMap, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

viewMap = {
  BOOLEAN: _dereq_('./facets/boolean'),
  DATE: _dereq_('./facets/date'),
  RANGE: _dereq_('./facets/range'),
  LIST: _dereq_('./facets/list')
};

config = _dereq_('../config');

Facets = (function(_super) {
  __extends(Facets, _super);

  function Facets() {
    this.renderFacet = __bind(this.renderFacet, this);
    return Facets.__super__.constructor.apply(this, arguments);
  }

  Facets.prototype.initialize = function(options) {
    _.extend(viewMap, options.viewMap);
    return this.views = {};
  };

  Facets.prototype.render = function(el, data) {
    var facetData, fragment, index, _i, _len, _results;
    this.destroyFacets();
    if (config.templates.hasOwnProperty('main')) {
      _results = [];
      for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
        facetData = data[index];
        if (viewMap.hasOwnProperty(facetData.type)) {
          _results.push(el.querySelector("." + facetData.name + "-placeholder").appendChild(this.renderFacet(facetData).el));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    } else {
      fragment = document.createDocumentFragment();
      for (index in data) {
        if (!__hasProp.call(data, index)) continue;
        facetData = data[index];
        if (viewMap.hasOwnProperty(facetData.type)) {
          fragment.appendChild(this.renderFacet(facetData).el);
          fragment.appendChild(document.createElement('hr'));
        } else {
          console.error('Unknown facetView', facetData.type);
        }
      }
      el.querySelector('.facets').innerHTML = '';
      return el.querySelector('.facets').appendChild(fragment);
    }
  };

  Facets.prototype.renderFacet = function(facetData) {
    var View, view;
    if (_.isString(facetData)) {
      facetData = _.findWhere(this.searchResults.first().get('facets'), {
        name: facetData
      });
    }
    View = viewMap[facetData.type];
    view = this.views[facetData.name] = new View({
      attrs: facetData
    });
    this.listenTo(view, 'change', (function(_this) {
      return function(queryOptions, options) {
        if (options == null) {
          options = {};
        }
        return _this.trigger('change', queryOptions, options);
      };
    })(this));
    return view;
  };

  Facets.prototype.update = function(facets) {
    var facetData, index, _results;
    _results = [];
    for (index in facets) {
      if (!__hasProp.call(facets, index)) continue;
      facetData = facets[index];
      if (this.views.hasOwnProperty(facetData.name)) {
        _results.push(this.views[facetData.name].update(facetData.options));
      } else {
        _results.push(void 0);
      }
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
      if (facetView.hasOwnProperty('reset')) {
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
    span.text("" + text + " facets");
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


},{"../config":10,"./facets/boolean":22,"./facets/date":23,"./facets/list":24,"./facets/range":27,"backbone":"j6c3vP","underscore":"lkcZM4"}],22:[function(_dereq_,module,exports){
var $, BooleanFacet, Models, StringFn, Views, bodyTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

StringFn = _dereq_('hilib/src/utils/string');

Models = {
  Boolean: _dereq_('../../models/boolean')
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
      ucfirst: StringFn.ucfirst
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


},{"../../../jade/facets/boolean.body.jade":29,"../../models/boolean":12,"./main":26,"hilib/src/utils/string":6,"jquery":"D1nrrK","underscore":"lkcZM4"}],23:[function(_dereq_,module,exports){
var DateFacet, Models, StringFn, Views, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StringFn = _dereq_('hilib/src/utils/string');

Models = {
  Date: _dereq_('../../models/date')
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
      ucfirst: StringFn.ucfirst
    }));
    this.$('.placeholder').html(rtpl);
    return this;
  };

  DateFacet.prototype.update = function(newOptions) {};

  DateFacet.prototype.reset = function() {};

  return DateFacet;

})(Views.Facet);

module.exports = DateFacet;


},{"../../../jade/facets/date.jade":30,"../../models/date":13,"./main":26,"hilib/src/utils/string":6}],24:[function(_dereq_,module,exports){
var $, Collections, Fn, ListFacet, Models, Views, config, menuTpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

config = _dereq_('../../config');

Fn = _dereq_('hilib/src/utils/general');

Models = {
  List: _dereq_('../../models/list')
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
    this.options = options;
    ListFacet.__super__.initialize.apply(this, arguments);
    this.model = new Models.List(this.options.attrs, {
      parse: true
    });
    this.collection = new Collections.Options(this.options.attrs.options, {
      parse: true
    });
    return this.render();
  };

  ListFacet.prototype.render = function() {
    var menu;
    ListFacet.__super__.render.apply(this, arguments);
    if (this.$('header .options').length > 0) {
      if (config.templates.hasOwnProperty('list.menu')) {
        menuTpl = config.templates['list.menu'];
      }
      menu = menuTpl({
        model: this.model.attributes
      });
      this.$('header .options').html(menu);
    }
    this.optionsView = new Views.Options({
      collection: this.collection,
      facetName: this.model.get('name')
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
      this.$('.active').removeClass('active');
      $target.addClass('active');
    }
    type = $target.hasClass('alpha') ? 'alpha' : 'amount';
    order = $target.hasClass('fa-sort-' + type + '-desc') ? 'desc' : 'asc';
    return this.collection.orderBy(type + '_' + order);
  };

  ListFacet.prototype.update = function(newOptions) {
    return this.collection.updateOptions(newOptions);
  };

  ListFacet.prototype.reset = function() {
    return this.collection.revert();
  };

  return ListFacet;

})(Views.Facet);

module.exports = ListFacet;


},{"../../../jade/facets/list.menu.jade":32,"../../collections/list.options":8,"../../config":10,"../../models/list":15,"./list.options":25,"./main":26,"hilib/src/utils/general":5,"jquery":"D1nrrK","underscore":"lkcZM4"}],25:[function(_dereq_,module,exports){
var $, Backbone, Fn, ListFacetOptions, Models, bodyTpl, config, optionTpl, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Fn = _dereq_('hilib/src/utils/general');

config = _dereq_('../../config');

Models = {
  List: _dereq_('../../models/list')
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
    this.options = options;
    this.showingCursor = 0;
    this.showingIncrement = 50;
    this.listenTo(this.collection, 'sort', (function(_this) {
      return function() {
        return _this.rerender();
      };
    })(this));
    if (config.templates.hasOwnProperty('list.option')) {
      optionTpl = config.templates['list.option'];
    }
    return this.render();
  };

  ListFacetOptions.prototype.render = function() {
    if (config.templates.hasOwnProperty('list.body')) {
      bodyTpl = config.templates['list.body'];
    }
    this.$el.html(bodyTpl({
      facetName: this.options.facetName
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
    return this.$('ul').html(tpl);
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
    return this.appendOptions(true);
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
    if (this.$('i.checked').length === 0 || !config.autoSearch) {
      return this.triggerChange();
    } else {
      return Fn.timeoutWithReset(1000, (function(_this) {
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
        name: this.options.facetName,
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
    values = _.map(visibleModels, function(item) {
      return item.get('name');
    });
    return this.triggerChange(values);
  };

  return ListFacetOptions;

})(Backbone.View);

module.exports = ListFacetOptions;


},{"../../../jade/facets/list.body.jade":31,"../../../jade/facets/list.option.jade":33,"../../config":10,"../../models/list":15,"backbone":"j6c3vP","hilib/src/utils/general":5,"jquery":"D1nrrK","underscore":"lkcZM4"}],26:[function(_dereq_,module,exports){
var $, Backbone, Facet, config, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

config = _dereq_('../../config');

tpl = _dereq_('../../../jade/facets/main.jade');

Facet = (function(_super) {
  __extends(Facet, _super);

  function Facet() {
    return Facet.__super__.constructor.apply(this, arguments);
  }

  Facet.prototype.render = function() {
    if (config.templates.hasOwnProperty('facets.main')) {
      tpl = config.templates['facets.main'];
    }
    this.$el.html(tpl(this.model.attributes));
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


},{"../../../jade/facets/main.jade":34,"../../config":10,"backbone":"j6c3vP","jquery":"D1nrrK","underscore":"lkcZM4"}],27:[function(_dereq_,module,exports){
var $, Models, RangeFacet, Views, bodyTpl, config, handleSize, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$ = _dereq_('jquery');

_ = _dereq_('underscore');

config = _dereq_('../../config');

Models = {
  Range: _dereq_('../../models/range')
};

Views = {
  Facet: _dereq_('./main')
};

bodyTpl = _dereq_('../../../jade/facets/range.body.jade');

handleSize = 12;

RangeFacet = (function(_super) {
  __extends(RangeFacet, _super);

  function RangeFacet() {
    return RangeFacet.__super__.constructor.apply(this, arguments);
  }

  RangeFacet.prototype.className = 'facet range';

  RangeFacet.prototype.initialize = function(options) {
    RangeFacet.__super__.initialize.apply(this, arguments);
    this.draggingMin = false;
    this.dragginMax = false;
    this.model = new Models.Range(options.attrs, {
      parse: true
    });
    this.listenTo(this.model, 'change:options', this.render);
    return this.render();
  };

  RangeFacet.prototype.render = function() {
    var rtpl;
    RangeFacet.__super__.render.apply(this, arguments);
    if (config.templates.hasOwnProperty('range.body')) {
      bodyTpl = config.templates['range.body'];
    }
    rtpl = bodyTpl(this.model.attributes);
    this.$('.body').html(rtpl);
    this.$('header .menu').hide();
    setTimeout(((function(_this) {
      return function() {
        return _this.postRender();
      };
    })(this)), 0);
    this.$el.mouseleave((function(_this) {
      return function() {
        return _this.stopDragging();
      };
    })(this));
    return this;
  };

  RangeFacet.prototype.postRender = function() {
    var $slider;
    this.$minHandle = this.$('.min-handle');
    this.$maxHandle = this.$('.max-handle');
    this.$minValue = this.$('.min-value');
    this.$maxValue = this.$('.max-value');
    this.$bar = this.$('.bar');
    $slider = this.$('.slider');
    this.sliderWidth = $slider.width();
    this.sliderLeft = $slider.offset().left;
    this.minHandleLeft = handleSize / -2;
    this.maxHandleLeft = this.sliderWidth - (handleSize / 2);
    return this.$maxHandle.css('left', this.maxHandleLeft);
  };

  RangeFacet.prototype.events = function() {
    return {
      'mousedown .max-handle': 'startDragging',
      'mousedown .min-handle': 'startDragging',
      'mouseup': 'stopDragging',
      'mousemove': 'drag',
      'click .slider': 'moveHandle',
      'click button': 'doSearch'
    };
  };

  RangeFacet.prototype.doSearch = function(ev) {
    ev.preventDefault();
    return this.triggerChange();
  };

  RangeFacet.prototype.triggerChange = function(options) {
    var queryOptions;
    if (options == null) {
      options = {};
    }
    queryOptions = {
      facetValue: {
        name: this.model.get('name'),
        lowerLimit: +(this.$minValue.html() + '0101'),
        upperLimit: +(this.$maxValue.html() + '1231')
      }
    };
    return this.trigger('change', queryOptions, options);
  };

  RangeFacet.prototype.moveHandle = function(ev) {
    var left;
    if (!(ev.target === this.el.querySelector('.slider') || ev.target === this.el.querySelector('.bar'))) {
      return;
    }
    left = ev.clientX - this.sliderLeft;
    if (Math.abs(this.$minHandle.position().left - left) < Math.abs(this.$maxHandle.position().left - left)) {
      this.$minHandle.css('left', left - (handleSize / 2));
      this.$bar.css('left', left);
      return this.updateValue(this.$minValue, left);
    } else {
      this.$maxHandle.css('left', left - (handleSize / 2));
      this.$bar.css('right', this.sliderWidth - left);
      return this.updateValue(this.$maxValue, left);
    }
  };

  RangeFacet.prototype.startDragging = function(ev) {
    var target;
    target = $(ev.currentTarget);
    if (target.hasClass('max-handle')) {
      this.draggingMax = true;
      this.$minHandle.css('z-index', 10);
    } else if (target.hasClass('min-handle')) {
      this.draggingMin = true;
      this.$maxHandle.css('z-index', 10);
    }
    return target.css('z-index', 11);
  };

  RangeFacet.prototype.stopDragging = function() {
    var handlesCenter, left, maxRect, minRect;
    this.draggingMin = false;
    this.draggingMax = false;
    minRect = this.$minValue[0].getBoundingClientRect();
    maxRect = this.$maxValue[0].getBoundingClientRect();
    if (!(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)) {
      this.$minValue.css('opacity', 0);
      this.$maxValue.css('opacity', 0);
      this.$('.single-value').show();
      handlesCenter = this.minHandleLeft + ((this.maxHandleLeft - this.minHandleLeft) / 2);
      left = handlesCenter - this.$('.single-value').width() / 2 + 6;
      if (this.sliderWidth - left < this.$('.single-value').width()) {
        left = this.sliderWidth - this.$('.single-value').width() + 18;
      }
      return this.$('.single-value').css('left', left);
    } else {
      this.$minValue.css('opacity', 1);
      this.$maxValue.css('opacity', 1);
      return this.$('.single-value').hide();
    }
  };

  RangeFacet.prototype.drag = function(ev) {
    var left;
    if (this.draggingMin) {
      left = ev.clientX - this.sliderLeft;
      this.minHandleLeft = left - (handleSize / 2);
      if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
        this.$minHandle.css('left', this.minHandleLeft);
        this.$bar.css('left', left);
        this.updateValue('minValue', left);
      }
    }
    if (this.draggingMax) {
      left = ev.clientX - this.sliderLeft;
      this.maxHandleLeft = left - (handleSize / 2);
      if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
        this.$maxHandle.css('left', this.maxHandleLeft);
        this.$bar.css('right', this.sliderWidth - left);
        return this.updateValue('maxValue', left);
      }
    }
  };

  RangeFacet.prototype.updateValue = function(handle, left) {
    var $el, html, ll, ul, value;
    this.$('button').show();
    ll = this.model.get('options').lowerLimit;
    ul = this.model.get('options').upperLimit;
    value = Math.floor((left / this.sliderWidth * (ul - ll)) + ll);
    $el = handle === 'minValue' ? this.$minValue : this.$maxValue;
    $el.html(value);
    html = handle === 'minValue' ? "" + value + " - " + (this.$maxValue.html()) : "" + (this.$minValue.html()) + " - " + value;
    this.$('.single-value').html(html);
    if (!config.autoSearch) {
      return this.triggerChange({
        silent: true
      });
    }
  };

  RangeFacet.prototype.getLeftPosFromYear = function(year) {
    var left, ll, ul;
    ll = this.model.get('options').lowerLimit;
    ul = this.model.get('options').upperLimit;
    left = ((year - ll) / (ul - ll)) * this.sliderWidth;
    return Math.floor(left);
  };

  RangeFacet.prototype.setMinValue = function(year) {
    var left;
    left = this.getLeftPosFromYear(year);
    this.$minHandle.css('left', left);
    this.$minValue.html(year);
    this.$bar.css('left', left);
    return this.minHandleLeft = left - (handleSize / 2);
  };

  RangeFacet.prototype.setMaxValue = function(year) {
    var left;
    left = this.getLeftPosFromYear(year);
    this.$maxHandle.css('left', left);
    this.$maxValue.html(year);
    this.$bar.css('right', this.sliderWidth - left);
    return this.maxHandleLeft = left - (handleSize / 2);
  };

  RangeFacet.prototype.update = function(newOptions) {
    if (_.isArray(newOptions)) {
      newOptions = newOptions[0];
    }
    this.setMinValue(+(newOptions.lowerLimit + '').substr(0, 4));
    this.setMaxValue(+(newOptions.upperLimit + '').substr(0, 4));
    return this.$('button').hide();
  };

  return RangeFacet;

})(Views.Facet);

module.exports = RangeFacet;


},{"../../../jade/facets/range.body.jade":35,"../../config":10,"../../models/range":18,"./main":26,"jquery":"D1nrrK","underscore":"lkcZM4"}],28:[function(_dereq_,module,exports){
var Backbone, Models, TextSearch, config, dom, tpl, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

dom = _dereq_('hilib/src/utils/dom');

config = _dereq_('../config');

Models = {
  Search: _dereq_('../models/search')
};

tpl = _dereq_('../../jade/facets/text-search.jade');

TextSearch = (function(_super) {
  __extends(TextSearch, _super);

  function TextSearch() {
    return TextSearch.__super__.constructor.apply(this, arguments);
  }

  TextSearch.prototype.className = 'text-search';

  TextSearch.prototype.initialize = function(options) {
    return this.reset();
  };

  TextSearch.prototype.setModel = function() {
    if (this.model != null) {
      this.stopListening(this.model);
    }
    return this.model = new Models.Search(config.textSearchOptions);
  };

  TextSearch.prototype.render = function() {
    if (config.templates.hasOwnProperty('search')) {
      tpl = config.templates['search'];
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
    if (this.model.get('term') !== ev.currentTarget.value) {
      this.model.set({
        term: ev.currentTarget.value
      });
      this.updateQueryModel();
    }
    if (ev.keyCode === 13) {
      ev.preventDefault();
      return this.search(ev);
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


},{"../../jade/facets/text-search.jade":36,"../config":10,"../models/search":19,"backbone":"j6c3vP","hilib/src/utils/dom":4,"underscore":"lkcZM4"}],29:[function(_dereq_,module,exports){
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
},{"jade/runtime":7}],30:[function(_dereq_,module,exports){
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
},{"jade/runtime":7}],31:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<ul></ul>");;return buf.join("");
};
},{"jade/runtime":7}],32:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<input type=\"checkbox\" name=\"all\"/><input type=\"text\" name=\"filter\"/><small class=\"optioncount\"></small>");;return buf.join("");
};
},{"jade/runtime":7}],33:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (option) {
buf.push("<li" + (jade.attr("data-count", option.get('count'), true, false)) + (jade.attr("data-value", option.id, true, false)) + "><i" + (jade.attr("data-value", option.id, true, false)) + (jade.cls(['unchecked','fa','fa-square-o',option.get('checked')?'hidden':'visible'], [null,null,null,true])) + "></i><i" + (jade.attr("data-value", option.id, true, false)) + (jade.cls(['checked','fa','fa-check-square-o',option.get('checked')?'visible':'hidden'], [null,null,null,true])) + "></i><label" + (jade.attr("data-value", option.id, true, false)) + ">" + (null == (jade_interp = option.id === ':empty' ? '<em>(empty)</em>' : option.id) ? "" : jade_interp) + "</label><div class=\"count\">" + (jade.escape(null == (jade_interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade_interp)) + "</div></li>");}("option" in locals_for_with?locals_for_with.option:typeof option!=="undefined"?option:undefined));;return buf.join("");
};
},{"jade/runtime":7}],34:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (name, title) {
buf.push("<div class=\"placeholder pad3\"><header><h3" + (jade.attr("data-name", name, true, false)) + ">" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</h3><div class=\"menu\"><i title=\"Filter options\" class=\"filter fa fa-filter\"></i><i title=\"Sort alphabetically\" class=\"alpha fa fa-sort-alpha-asc\"></i><i title=\"Sort numerically\" class=\"amount active fa fa-sort-amount-desc\"></i></div><div class=\"options\"></div></header><div class=\"body\"></div></div>");}("name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"title" in locals_for_with?locals_for_with.title:typeof title!=="undefined"?title:undefined));;return buf.join("");
};
},{"jade/runtime":7}],35:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (options) {
buf.push("<div class=\"slider\"><div class=\"min-handle\"></div><div class=\"max-handle\"></div><div class=\"bar\">&nbsp;</div><div class=\"min-value\">" + (jade.escape(null == (jade_interp = options.lowerLimit) ? "" : jade_interp)) + "</div><div class=\"max-value\">" + (jade.escape(null == (jade_interp = options.upperLimit) ? "" : jade_interp)) + "</div><button>Search?</button></div>");}("options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined));;return buf.join("");
};
},{"jade/runtime":7}],36:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (model) {
buf.push("<div class=\"placeholder pad3\"><div class=\"body\"><div class=\"search-input\"><input type=\"text\" name=\"search\"/><i class=\"fa fa-search\"></i></div><div class=\"menu\"><i class=\"fa fa-times\"></i><div class=\"row-1\"><div class=\"cell-1\"><input id=\"cb_casesensitive\" type=\"checkbox\" name=\"cb_casesensitive\" data-attr=\"caseSensitive\"/><label for=\"cb_casesensitive\">Match case</label></div><div class=\"cell-2\"><input id=\"cb_fuzzy\" type=\"checkbox\" name=\"cb_fuzzy\" data-attr=\"fuzzy\"/><label for=\"cb_fuzzy\">Fuzzy</label></div></div><div class=\"row-2\">");
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
if ( model.has('textLayers'))
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
},{"jade/runtime":7}],37:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<div class=\"overlay\"><div><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div><div class=\"faceted-search\"><form><div class=\"text-search-placeholder\"></div><ul class=\"facets-menu\"><li class=\"reset\"><button><i class=\"fa fa-refresh\"></i><span>Reset search</span></button></li><li class=\"switch\"><button><i class=\"fa fa-angle-double-down\"></i><span>Switch to</span></button></li><li class=\"collapse-expand\"><button><i class=\"fa fa-compress\"></i><span>Collapse facets</span></button></li></ul><div class=\"facets\"><div class=\"loader\"><h4>Loading search...</h4><br/><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div></div></form></div>");;return buf.join("");
};
},{"jade/runtime":7}]},{},[11])
(11)
});