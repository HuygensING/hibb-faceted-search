(function (root, factory) {
    if (typeof define === 'function' && define.amd) {

        // define(factory);
        define(['jquery', 'underscore', 'backbone'], factory);

    } else {

        root['facetedsearch'] = factory();
    }
// }(this, function () {
}(this, function ($, _, Backbone) {

/**
 * almond 0.2.7 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../lib/almond/almond", function(){});

(function() {
  var __hasProp = {}.hasOwnProperty;

  define('hilib/functions/general',['require','jquery'],function(require) {
    var $;
    $ = require('jquery');
    return {
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
      /* Escape a regular expression*/

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
  });

}).call(this);

(function() {
  define('hilib/functions/dom',['require'],function(require) {
    return function(el) {
      return {
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
          while (loopEl !== parent) {
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
        insertAfter: function(newElement, referenceElement) {
          return referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
        },
        highlightUntil: function(endNode, highlightClass) {
          if (highlightClass == null) {
            highlightClass = 'highlight';
          }
          return {
            on: function() {
              var currentNode, filter, range, treewalker,
                _this = this;
              range = document.createRange();
              range.setStartAfter(el);
              range.setEndBefore(endNode);
              filter = function(node) {
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
              filter.acceptNode = filter;
              treewalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT, filter, false);
              while (treewalker.nextNode()) {
                currentNode = treewalker.currentNode;
                if ((' ' + currentNode.className + ' ').indexOf(' text ') > -1) {
                  currentNode.className = currentNode.className + ' ' + highlightClass;
                }
              }
              return this;
            },
            off: function() {
              var classNames, _i, _len, _ref, _results;
              _ref = document.querySelectorAll('.' + highlightClass);
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                el = _ref[_i];
                classNames = ' ' + el.className + ' ';
                classNames = classNames.replace(' ' + highlightClass + ' ', '');
                _results.push(el.className = classNames.replace(/^\s+|\s+$/g, ''));
              }
              return _results;
            }
          };
        }
      };
    };
  });

}).call(this);

(function() {
  define('hilib/mixins/pubsub',['require','backbone'],function(require) {
    var Backbone;
    Backbone = require('backbone');
    return {
      subscribe: function(ev, done) {
        return this.listenTo(Backbone, ev, done);
      },
      publish: function() {
        return Backbone.trigger.apply(Backbone, arguments);
      }
    };
  });

}).call(this);

(function() {
  define('config',['require'],function(require) {
    return {
      baseUrl: '',
      searchPath: '',
      search: true,
      token: null,
      queryOptions: {},
      facetNameMap: {}
    };
  });

}).call(this);

(function() {
  define('hilib/functions/string',['require','jquery'],function(require) {
    var $;
    $ = require('jquery');
    return {
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
  });

}).call(this);

/* UP FOR REMOVAL*/


(function() {
  define('hilib/managers/pubsub',['require','backbone'],function(require) {
    var Backbone;
    Backbone = require('backbone');
    return {
      subscribe: function(ev, cb) {
        return this.listenTo(Backbone, ev, cb);
      },
      publish: function() {
        return Backbone.trigger.apply(Backbone, arguments);
      }
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/base',['require','backbone','hilib/managers/pubsub'],function(require) {
    var Backbone, Base, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('hilib/managers/pubsub');
    return Base = (function(_super) {
      __extends(Base, _super);

      function Base() {
        _ref = Base.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Base.prototype.initialize = function() {
        return _.extend(this, Pubsub);
      };

      return Base;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/facet',['require','config','models/base'],function(require) {
    var Facet, Models, config, _ref;
    config = require('config');
    Models = {
      Base: require('models/base')
    };
    return Facet = (function(_super) {
      __extends(Facet, _super);

      function Facet() {
        _ref = Facet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Facet.prototype.idAttribute = 'name';

      Facet.prototype.parse = function(attrs) {
        if ((attrs.title == null) || attrs.title === '' && (config.facetNameMap[attrs.name] != null)) {
          attrs.title = config.facetNameMap[attrs.name];
        }
        return attrs;
      };

      return Facet;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/boolean',['require','models/facet'],function(require) {
    var BooleanFacet, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    return BooleanFacet = (function(_super) {
      __extends(BooleanFacet, _super);

      function BooleanFacet() {
        _ref = BooleanFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BooleanFacet.prototype.set = function(attrs, options) {
        if (attrs === 'options') {
          options = this.parseOptions(options);
        } else if (attrs.options != null) {
          attrs.options = this.parseOptions(attrs.options);
        }
        return BooleanFacet.__super__.set.call(this, attrs, options);
      };

      BooleanFacet.prototype.parseOptions = function(options) {
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
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/base',['require','backbone','hilib/managers/pubsub'],function(require) {
    var Backbone, BaseView, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('hilib/managers/pubsub');
    return BaseView = (function(_super) {
      __extends(BaseView, _super);

      function BaseView() {
        _ref = BaseView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BaseView.prototype.initialize = function() {
        return _.extend(this, Pubsub);
      };

      return BaseView;

    })(Backbone.View);
  });

}).call(this);

(function(e){if("function"==typeof bootstrap)bootstrap("jade",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define('jade',e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeJade=e}else"undefined"!=typeof window?window.jade=e():global.jade=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*!
 * Jade - runtime
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Lame Array.isArray() polyfill for now.
 */

if (!Array.isArray) {
  Array.isArray = function(arr){
    return '[object Array]' == Object.prototype.toString.call(arr);
  };
}

/**
 * Lame Object.keys() polyfill for now.
 */

if (!Object.keys) {
  Object.keys = function(obj){
    var arr = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  }
}

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
 * @api private
 */

function joinClasses(val) {
  return Array.isArray(val) ? val.map(joinClasses).filter(nulls).join(' ') : val;
}

/**
 * Render the given attributes object.
 *
 * @param {Object} obj
 * @param {Object} escaped
 * @return {String}
 * @api private
 */

exports.attrs = function attrs(obj, escaped){
  var buf = []
    , terse = obj.terse;

  delete obj.terse;
  var keys = Object.keys(obj)
    , len = keys.length;

  if (len) {
    buf.push('');
    for (var i = 0; i < len; ++i) {
      var key = keys[i]
        , val = obj[key];

      if ('boolean' == typeof val || null == val) {
        if (val) {
          terse
            ? buf.push(key)
            : buf.push(key + '="' + key + '"');
        }
      } else if (0 == key.indexOf('data') && 'string' != typeof val) {
        buf.push(key + "='" + JSON.stringify(val) + "'");
      } else if ('class' == key) {
        if (escaped && escaped[key]){
          if (val = exports.escape(joinClasses(val))) {
            buf.push(key + '="' + val + '"');
          }
        } else {
          if (val = joinClasses(val)) {
            buf.push(key + '="' + val + '"');
          }
        }
      } else if (escaped && escaped[key]) {
        buf.push(key + '="' + exports.escape(val) + '"');
      } else {
        buf.push(key + '="' + val + '"');
      }
    }
  }

  return buf.join(' ');
};

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

exports.escape = function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    str =  str || require('fs').readFileSync(filename, 'utf8')
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

},{"fs":2}],2:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}]},{},[1])(1)
});
;
define('tpls',['jade'], function(jade) { if(jade && jade['runtime'] !== undefined) { jade = jade.runtime; }

this["JST"] = this["JST"] || {};

this["JST"]["faceted-search/facets/boolean.body"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),options = locals_.options,name = locals_.name,ucfirst = locals_.ucfirst;buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(name+'_'+option.name), 'name':(name+'_'+option.name), 'type':("checkbox"), 'data-value':(option.name) }, {"id":true,"name":true,"type":true,"data-value":true})) + "/><label" + (jade.attrs({ 'for':(name+'_'+option.name) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(name+'_'+option.name), 'name':(name+'_'+option.name), 'type':("checkbox"), 'data-value':(option.name) }, {"id":true,"name":true,"type":true,"data-value":true})) + "/><label" + (jade.attrs({ 'for':(name+'_'+option.name) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = ucfirst(option.name)) ? "" : jade.interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.count) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/date"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),name = locals_.name,title = locals_.title,options = locals_.options;buf.push("<header><h3" + (jade.attrs({ 'data-name':(name) }, {"data-name":true})) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3></header><div class=\"body\"><label>From:</label><select>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
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

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

buf.push("<option>" + (jade.escape(null == (jade.interp = option) ? "" : jade.interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.body"] = function anonymous(locals) {
var buf = [];
buf.push("<ul></ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.menu"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"row span4 align middle\"><div class=\"cell span2\"><input type=\"text\" name=\"filter\"/></div><div class=\"cell span1\"><small class=\"optioncount\"></small></div><div class=\"cell span1 alignright\"><nav><ul><li class=\"all\">All </li><li class=\"none\">None</li></ul></nav></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/list.options"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),options = locals_.options,generateID = locals_.generateID;buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

randomId = generateID();
buf.push("<li><div" + (jade.attrs({ 'data-count':(option.get('count')), "class": [('row'),('span6')] }, {"data-count":true})) + "><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(randomId), 'name':(randomId), 'type':("checkbox"), 'data-value':(option.id), 'checked':(option.get('checked')?true:false) }, {"id":true,"name":true,"type":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':(randomId) }, {"for":true})) + ">" + (null == (jade.interp = option.id === ':empty' ? '<i>(empty)</i>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

randomId = generateID();
buf.push("<li><div" + (jade.attrs({ 'data-count':(option.get('count')), "class": [('row'),('span6')] }, {"data-count":true})) + "><div class=\"cell span5\"><input" + (jade.attrs({ 'id':(randomId), 'name':(randomId), 'type':("checkbox"), 'data-value':(option.id), 'checked':(option.get('checked')?true:false) }, {"id":true,"name":true,"type":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':(randomId) }, {"for":true})) + ">" + (null == (jade.interp = option.id === ':empty' ? '<i>(empty)</i>' : option.id) ? "" : jade.interp) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade.interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade.interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");;return buf.join("");
};

this["JST"]["faceted-search/facets/main"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),name = locals_.name,title = locals_.title;buf.push("<div class=\"placeholder pad4\"><header><h3" + (jade.attrs({ 'data-name':(name) }, {"data-name":true})) + ">" + (jade.escape(null == (jade.interp = title) ? "" : jade.interp)) + "</h3><svg version=\"1.1\" baseProfile=\"full\" width=\"12\" height=\"12\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"100\" cy=\"100\" r=\"90\" fill=\"#EEE\" stroke=\"#666\" stroke-width=\"10\"></circle><rect x=\"50\" y=\"90\" width=\"100\" height=\"20\" fill=\"#222\"></rect><rect x=\"90\" y=\"50\" width=\"20\" height=\"100\" fill=\"#222\" class=\"vertical\"></rect></svg><div class=\"options\"></div></header><div class=\"body\"></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.body"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"row span4 align middle\"><div class=\"cell span3\"><div class=\"padr4\"><input type=\"text\" name=\"search\"/></div></div><div class=\"cell span1\"><button class=\"search\">Search</button></div></div>");;return buf.join("");
};

this["JST"]["faceted-search/facets/search.menu"] = function anonymous(locals) {
var buf = [];
var locals_ = (locals || {}),model = locals_.model;buf.push("<div class=\"row span1 align middle\"><div class=\"cell span1 casesensitive\"><input id=\"cb_casesensitive\" type=\"checkbox\" name=\"cb_casesensitive\" data-attr=\"caseSensitive\"/><label for=\"cb_casesensitive\">Match case</label></div><div class=\"cell span1 fuzzy\"><input id=\"cb_fuzzy\" type=\"checkbox\" name=\"cb_fuzzy\" data-attr=\"fuzzy\"/><label for=\"cb_fuzzy\">Fuzzy</label></div></div>");
if ( model.has('searchInAnnotations') || model.has('searchInTranscriptions'))
{
buf.push("<div class=\"row span1\"><div class=\"cell span1\"><h4>Search</h4><ul class=\"searchins\">");
if ( model.has('searchInTranscriptions'))
{
buf.push("<li class=\"searchin\"><input" + (jade.attrs({ 'id':("cb_searchin_transcriptions"), 'type':("checkbox"), 'data-attr':("searchInTranscriptions"), 'checked':(model.get('searchInTranscriptions')) }, {"id":true,"type":true,"data-attr":true,"checked":true})) + "/><label for=\"cb_searchin_transcriptions\">Transcriptions</label></li>");
}
if ( model.has('searchInAnnotations'))
{
buf.push("<li class=\"searchin\"><input" + (jade.attrs({ 'id':("cb_searchin_annotations"), 'type':("checkbox"), 'data-attr':("searchInAnnotations"), 'checked':(model.get('searchInAnnotations')) }, {"id":true,"type":true,"data-attr":true,"checked":true})) + "/><label for=\"cb_searchin_annotations\">Annotations</label></li>");
}
buf.push("</ul></div></div>");
}
if ( model.has('textLayers'))
{
buf.push("<div class=\"row span1\"><div class=\"cell span1\"><h4>Text layers</h4><ul class=\"textlayers\">");
// iterate model.get('textLayers')
;(function(){
  var $$obj = model.get('textLayers');
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attrs({ 'id':('cb_textlayer'+textLayer), 'type':("checkbox"), 'data-attr-array':("textLayers"), 'data-value':(textLayer), 'checked':(true) }, {"id":true,"type":true,"data-attr-array":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':('cb_textlayer'+textLayer) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var textLayer = $$obj[$index];

buf.push("<li class=\"textlayer\"><input" + (jade.attrs({ 'id':('cb_textlayer'+textLayer), 'type':("checkbox"), 'data-attr-array':("textLayers"), 'data-value':(textLayer), 'checked':(true) }, {"id":true,"type":true,"data-attr-array":true,"data-value":true,"checked":true})) + "/><label" + (jade.attrs({ 'for':('cb_textlayer'+textLayer) }, {"for":true})) + ">" + (jade.escape(null == (jade.interp = textLayer) ? "" : jade.interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul></div></div>");
};return buf.join("");
};

this["JST"]["faceted-search/main"] = function anonymous(locals) {
var buf = [];
buf.push("<div class=\"overlay\"><img src=\"../images/faceted-search/loader.gif\"/></div><div class=\"faceted-search\"><form><div class=\"search-placeholder\"></div><div class=\"facets\"><div class=\"loader\"><h4>Loading facets...</h4><br/><img src=\"../images/faceted-search/loader.gif\"/></div></div></form></div>");;return buf.join("");
};

return this["JST"];

});
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/main',['require','views/base','tpls'],function(require) {
    var Facet, Views, tpls, _ref;
    Views = {
      Base: require('views/base')
    };
    tpls = require('tpls');
    return Facet = (function(_super) {
      __extends(Facet, _super);

      function Facet() {
        _ref = Facet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Facet.prototype.initialize = function() {
        return Facet.__super__.initialize.apply(this, arguments);
      };

      Facet.prototype.events = function() {
        return {
          'click h3': 'toggleBody',
          'click header svg': 'toggleOptions'
        };
      };

      Facet.prototype.toggleOptions = function(ev) {
        var svg;
        svg = this.el.querySelector('header svg');
        if (svg.hasAttribute('class')) {
          svg.removeAttribute('class');
        } else {
          svg.setAttribute('class', 'active');
        }
        this.$('header .options').slideToggle();
        return this.$('header .options input[name="filter"]').focus();
      };

      Facet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = tpls['faceted-search/facets/main'](this.model.attributes);
        this.$el.html(rtpl);
        return this;
      };

      Facet.prototype.update = function(newOptions) {};

      return Facet;

    })(Views.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/boolean',['require','hilib/functions/string','models/boolean','views/facets/main','tpls'],function(require) {
    var BooleanFacet, Models, StringFn, Views, tpls, _ref;
    StringFn = require('hilib/functions/string');
    Models = {
      Boolean: require('models/boolean')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    return BooleanFacet = (function(_super) {
      __extends(BooleanFacet, _super);

      function BooleanFacet() {
        _ref = BooleanFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BooleanFacet.prototype.className = 'facet boolean';

      BooleanFacet.prototype.events = function() {
        return _.extend({}, BooleanFacet.__super__.events.apply(this, arguments), {
          'change input[type="checkbox"]': 'checkChanged'
        });
      };

      BooleanFacet.prototype.checkChanged = function(ev) {
        return this.trigger('change', {
          facetValue: {
            name: this.model.get('name'),
            values: _.map(this.$('input:checked'), function(input) {
              return input.getAttribute('data-value');
            })
          }
        });
      };

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
        rtpl = tpls['faceted-search/facets/boolean.body'](_.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.body').html(rtpl);
        this.$('header svg').hide();
        return this;
      };

      BooleanFacet.prototype.update = function(newOptions) {
        return this.model.set('options', newOptions);
      };

      BooleanFacet.prototype.reset = function() {
        return this.render();
      };

      return BooleanFacet;

    })(Views.Facet);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/date',['require','models/facet'],function(require) {
    var DateFacet, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    return DateFacet = (function(_super) {
      __extends(DateFacet, _super);

      function DateFacet() {
        _ref = DateFacet.__super__.constructor.apply(this, arguments);
        return _ref;
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
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/date',['require','hilib/functions/string','models/date','views/facets/main','tpls'],function(require) {
    var DateFacet, Models, StringFn, Views, tpls, _ref;
    StringFn = require('hilib/functions/string');
    Models = {
      Date: require('models/date')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    return DateFacet = (function(_super) {
      __extends(DateFacet, _super);

      function DateFacet() {
        _ref = DateFacet.__super__.constructor.apply(this, arguments);
        return _ref;
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
        rtpl = tpls['faceted-search/facets/date'](_.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.placeholder').html(rtpl);
        return this;
      };

      DateFacet.prototype.update = function(newOptions) {};

      DateFacet.prototype.reset = function() {};

      return DateFacet;

    })(Views.Facet);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/list',['require','models/facet'],function(require) {
    var List, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    return List = (function(_super) {
      __extends(List, _super);

      function List() {
        _ref = List.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return List;

    })(Models.Facet);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/list.option',['require','models/base'],function(require) {
    var ListItem, Models, _ref;
    Models = {
      Base: require('models/base')
    };
    return ListItem = (function(_super) {
      __extends(ListItem, _super);

      function ListItem() {
        _ref = ListItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListItem.prototype.idAttribute = 'name';

      ListItem.prototype.defaults = function() {
        return {
          name: '',
          count: 0,
          total: 0,
          checked: false
        };
      };

      ListItem.prototype.parse = function(attrs) {
        attrs.total = attrs.count;
        return attrs;
      };

      return ListItem;

    })(Models.Base);
  });

}).call(this);

(function() {
  define('collections/base',['require','backbone'],function(require) {
    var Backbone;
    Backbone = require('backbone');
    return Backbone.Collection;
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/list.options',['require','models/list.option','collections/base'],function(require) {
    var Collections, ListItems, Models, _ref;
    Models = {
      Option: require('models/list.option')
    };
    Collections = {
      Base: require('collections/base')
    };
    return ListItems = (function(_super) {
      __extends(ListItems, _super);

      function ListItems() {
        _ref = ListItems.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListItems.prototype.model = Models.Option;

      ListItems.prototype.comparator = function(model) {
        return -1 * +model.get('count');
      };

      ListItems.prototype.revert = function() {
        var _this = this;
        this.each(function(option) {
          return option.set('checked', false, {
            silent: true
          });
        });
        return this.trigger('change');
      };

      ListItems.prototype.updateOptions = function(newOptions) {
        var _this = this;
        if (newOptions == null) {
          newOptions = [];
        }
        this.each(function(option) {
          return option.set('count', 0, {
            silent: true
          });
        });
        _.each(newOptions, function(newOption) {
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
        });
        return this.sort();
      };

      return ListItems;

    })(Collections.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/list.options',['require','hilib/functions/general','views/base','models/list','tpls'],function(require) {
    var Fn, ListOptions, Models, Views, tpls, _ref;
    Fn = require('hilib/functions/general');
    Views = {
      Base: require('views/base')
    };
    Models = {
      List: require('models/list')
    };
    tpls = require('tpls');
    return ListOptions = (function(_super) {
      __extends(ListOptions, _super);

      function ListOptions() {
        _ref = ListOptions.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListOptions.prototype.filtered_items = [];

      ListOptions.prototype.events = function() {
        return {
          'change input[type="checkbox"]': 'checkChanged'
        };
      };

      ListOptions.prototype.checkChanged = function(ev) {
        var id;
        id = ev.currentTarget.getAttribute('data-value');
        this.collection.get(id).set('checked', ev.currentTarget.checked);
        return this.trigger('change', {
          facetValue: {
            name: this.options.facetName,
            values: _.map(this.$('input:checked'), function(input) {
              return input.getAttribute('data-value');
            })
          }
        });
      };

      ListOptions.prototype.initialize = function() {
        ListOptions.__super__.initialize.apply(this, arguments);
        this.listenTo(this.collection, 'sort', this.render);
        this.listenTo(this.collection, 'change', this.render);
        return this.render();
      };

      ListOptions.prototype.render = function() {
        var options, rtpl;
        options = this.filtered_items.length > 0 ? this.filtered_items : this.collection.models;
        rtpl = tpls['faceted-search/facets/list.options']({
          options: options,
          generateID: Fn.generateID
        });
        return this.$el.html(rtpl);
      };

      /*
      		Called by parent (ListFacet) when user types in the search input
      */


      ListOptions.prototype.filterOptions = function(value) {
        var re;
        re = new RegExp(value, 'i');
        this.filtered_items = this.collection.filter(function(item) {
          return re.test(item.id);
        });
        this.trigger('filter:finished');
        return this.render();
      };

      return ListOptions;

    })(Views.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/list',['require','hilib/functions/general','models/list','collections/list.options','views/facets/main','views/facets/list.options','tpls'],function(require) {
    var Collections, Fn, ListFacet, Models, Views, tpls, _ref;
    Fn = require('hilib/functions/general');
    Models = {
      List: require('models/list')
    };
    Collections = {
      Options: require('collections/list.options')
    };
    Views = {
      Facet: require('views/facets/main'),
      Options: require('views/facets/list.options')
    };
    tpls = require('tpls');
    return ListFacet = (function(_super) {
      __extends(ListFacet, _super);

      function ListFacet() {
        _ref = ListFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListFacet.prototype.checked = [];

      ListFacet.prototype.filtered_items = [];

      ListFacet.prototype.className = 'facet list';

      ListFacet.prototype.events = function() {
        return _.extend({}, ListFacet.__super__.events.apply(this, arguments), {
          'click li.all': 'selectAll',
          'click li.none': 'deselectAll',
          'keyup input[name="filter"]': function(ev) {
            return this.optionsView.filterOptions(ev.currentTarget.value);
          }
        });
      };

      ListFacet.prototype.selectAll = function() {
        var cb, checkboxes, _i, _len, _results;
        checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        _results = [];
        for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
          cb = checkboxes[_i];
          _results.push(cb.checked = true);
        }
        return _results;
      };

      ListFacet.prototype.deselectAll = function() {
        var cb, checkboxes, _i, _len, _results;
        checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        _results = [];
        for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
          cb = checkboxes[_i];
          _results.push(cb.checked = false);
        }
        return _results;
      };

      ListFacet.prototype.initialize = function(options) {
        this.options = options;
        ListFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.List(this.options.attrs, {
          parse: true
        });
        return this.render();
      };

      ListFacet.prototype.render = function() {
        var body, menu, options,
          _this = this;
        ListFacet.__super__.render.apply(this, arguments);
        menu = tpls['faceted-search/facets/list.menu'](this.model.attributes);
        body = tpls['faceted-search/facets/list.body'](this.model.attributes);
        this.el.querySelector('header .options').innerHTML = menu;
        this.el.querySelector('.body').innerHTML = body;
        options = new Collections.Options(this.options.attrs.options, {
          parse: true
        });
        this.optionsView = new Views.Options({
          el: this.el.querySelector('.body'),
          collection: options,
          facetName: this.model.get('name')
        });
        this.listenTo(this.optionsView, 'filter:finished', this.renderFilteredOptionCount);
        this.listenTo(this.optionsView, 'change', function(data) {
          return _this.trigger('change', data);
        });
        return this;
      };

      ListFacet.prototype.renderFilteredOptionCount = function() {
        var collectionLength, filteredLength;
        filteredLength = this.optionsView.filtered_items.length;
        collectionLength = this.optionsView.collection.length;
        if (filteredLength === 0 || filteredLength === collectionLength) {
          this.$('header .options input[name="filter"]').addClass('nonefound');
          this.$('header small.optioncount').html('');
        } else {
          this.$('header .options input[name="filter"]').removeClass('nonefound');
          this.$('header small.optioncount').html(filteredLength + ' of ' + collectionLength);
        }
        return this;
      };

      ListFacet.prototype.update = function(newOptions) {
        return this.optionsView.collection.updateOptions(newOptions);
      };

      ListFacet.prototype.reset = function() {
        return this.optionsView.collection.revert();
      };

      return ListFacet;

    })(Views.Facet);
  });

}).call(this);

(function() {
  define('facetviewmap',['require','views/facets/boolean','views/facets/date','views/facets/list'],function(require) {
    return {
      BOOLEAN: require('views/facets/boolean'),
      DATE: require('views/facets/date'),
      LIST: require('views/facets/list')
    };
  });

}).call(this);

(function() {
  define('hilib/managers/token',['require','backbone','underscore','hilib/managers/pubsub'],function(require) {
    var Backbone, Pubsub, Token, _;
    Backbone = require('backbone');
    _ = require('underscore');
    Pubsub = require('hilib/managers/pubsub');
    Token = (function() {
      Token.prototype.token = null;

      function Token() {
        _.extend(this, Backbone.Events);
        _.extend(this, Pubsub);
      }

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
        if (this.token == null) {
          return false;
        }
        return this.token;
      };

      Token.prototype.clear = function() {
        sessionStorage.removeItem('huygens_token');
        return sessionStorage.removeItem('huygens_token_type');
      };

      return Token;

    })();
    return new Token();
  });

}).call(this);

(function() {
  define('hilib/managers/ajax',['require','jquery','hilib/managers/token'],function(require) {
    var $, defaultOptions, token;
    $ = require('jquery');
    $.support.cors = true;
    token = require('hilib/managers/token');
    defaultOptions = {
      token: true
    };
    return {
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
        var done, dopoll, testFn, url,
          _this = this;
        url = args.url, testFn = args.testFn, done = args.done;
        dopoll = function() {
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
        return dopoll();
      },
      fire: function(type, args, options) {
        var ajaxArgs,
          _this = this;
        options = $.extend({}, defaultOptions, options);
        ajaxArgs = {
          type: type,
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          processData: false,
          crossDomain: true
        };
        if (options.token) {
          ajaxArgs.beforeSend = function(xhr) {
            return xhr.setRequestHeader('Authorization', "" + (token.getType()) + " " + (token.get()));
          };
        }
        return $.ajax($.extend(ajaxArgs, args));
      }
    };
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('hilib/models/base',['require','backbone','hilib/managers/pubsub'],function(require) {
    var Backbone, Base, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('hilib/managers/pubsub');
    return Base = (function(_super) {
      __extends(Base, _super);

      function Base() {
        _ref = Base.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Base.prototype.initialize = function() {
        return _.extend(this, Pubsub);
      };

      return Base;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/searchresult',['require','hilib/managers/ajax','hilib/managers/token','config','hilib/models/base'],function(require) {
    var Models, SearchResult, ajax, config, token, _ref;
    ajax = require('hilib/managers/ajax');
    token = require('hilib/managers/token');
    config = require('config');
    Models = {
      Base: require('hilib/models/base')
    };
    return SearchResult = (function(_super) {
      __extends(SearchResult, _super);

      function SearchResult() {
        _ref = SearchResult.__super__.constructor.apply(this, arguments);
        return _ref;
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

      SearchResult.prototype.initialize = function(attrs, options) {
        this.options = options;
        SearchResult.__super__.initialize.apply(this, arguments);
        return this.postURL = null;
      };

      SearchResult.prototype.sync = function(method, model, options) {
        var jqXHR,
          _this = this;
        if (method === 'read') {
          if (this.options.url != null) {
            return this.getResults(this.options.url, options.success);
          } else {
            jqXHR = ajax.post({
              url: config.baseUrl + config.searchPath,
              data: JSON.stringify(this.options.queryOptions),
              dataType: 'text'
            });
            jqXHR.done(function(data, textStatus, jqXHR) {
              var url;
              if (jqXHR.status === 201) {
                _this.postURL = jqXHR.getResponseHeader('Location');
                url = _this.options.resultRows != null ? _this.postURL + '?rows=' + _this.options.resultRows : _this.postURL;
                return _this.getResults(url, options.success);
              }
            });
            return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
              if (jqXHR.status === 401) {
                return _this.publish('unauthorized');
              }
            });
          }
        }
      };

      SearchResult.prototype.getResults = function(url, done) {
        var jqXHR,
          _this = this;
        ajax.token = config.token;
        jqXHR = ajax.get({
          url: url
        });
        jqXHR.done(function(data, textStatus, jqXHR) {
          return done(data);
        });
        return jqXHR.fail(function() {
          return console.error('Failed getting FacetedSearch results from the server!', arguments);
        });
      };

      SearchResult.prototype.page = function(pagenumber, database) {
        var start, url,
          _this = this;
        start = this.options.resultRows * (pagenumber - 1);
        url = this.postURL + ("?rows=" + this.options.resultRows + "&start=" + start);
        if (database != null) {
          url += "&database=" + database;
        }
        return this.getResults(url, function(data) {
          _this.set(data);
          return _this.publish('change:page', _this);
        });
      };

      return SearchResult;

    })(Models.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/searchresults',['require','hilib/mixins/pubsub','models/searchresult','hilib/managers/ajax','hilib/managers/token','config'],function(require) {
    var SearchResult, SearchResults, ajax, config, pubsub, token, _ref;
    pubsub = require('hilib/mixins/pubsub');
    SearchResult = require('models/searchresult');
    ajax = require('hilib/managers/ajax');
    token = require('hilib/managers/token');
    config = require('config');
    return SearchResults = (function(_super) {
      __extends(SearchResults, _super);

      function SearchResults() {
        _ref = SearchResults.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SearchResults.prototype.model = SearchResult;

      SearchResults.prototype.initialize = function() {
        _.extend(this, pubsub);
        this.cachedModels = {};
        return this.on('add', this.setCurrent, this);
      };

      SearchResults.prototype.setCurrent = function(current) {
        var message;
        this.current = current;
        message = this.current.options.url != null ? 'change:cursor' : 'change:results';
        return this.publish(message, this.current);
      };

      SearchResults.prototype.runQuery = function(queryOptions) {
        var cacheString, options, searchResult,
          _this = this;
        cacheString = JSON.stringify(queryOptions);
        if (this.cachedModels.hasOwnProperty(cacheString)) {
          return this.setCurrent(this.cachedModels[cacheString]);
        } else {
          this.trigger('request');
          options = {};
          options.cacheString = cacheString;
          options.queryOptions = queryOptions;
          if (queryOptions.hasOwnProperty('resultRows')) {
            options.resultRows = queryOptions.resultRows;
            delete queryOptions.resultRows;
          }
          searchResult = new SearchResult(null, options);
          return searchResult.fetch({
            success: function(model) {
              _this.cachedModels[options.queryOptions] = model;
              return _this.add(model);
            }
          });
        }
      };

      SearchResults.prototype.moveCursor = function(direction) {
        var searchResult, url,
          _this = this;
        url = direction === '_prev' || direction === '_next' ? this.current.get(direction) : direction;
        if (url != null) {
          if (this.cachedModels.hasOwnProperty(url)) {
            return this.setCurrent(this.cachedModels[url]);
          } else {
            searchResult = new SearchResult(null, {
              url: url
            });
            return searchResult.fetch({
              success: function(model, response, options) {
                _this.cachedModels[url] = model;
                return _this.add(model);
              }
            });
          }
        }
      };

      return SearchResults;

    })(Backbone.Collection);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/main',['require','collections/searchresults'],function(require) {
    var FacetedSearch, SearchResults, _ref;
    SearchResults = require('collections/searchresults');
    return FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.defaults = function() {
        return {
          facetValues: []
        };
      };

      FacetedSearch.prototype.initialize = function(queryOptions, options) {
        var _this = this;
        this.queryOptions = queryOptions;
        this.searchResults = new SearchResults();
        this.on('change', function(model, options) {
          return _this.searchResults.runQuery(_this.attributes);
        });
        return this.trigger('change');
      };

      FacetedSearch.prototype.set = function(attrs, options) {
        var facetValues;
        if (attrs.facetValue != null) {
          facetValues = _.reject(this.get('facetValues'), function(data) {
            return data.name === attrs.facetValue.name;
          });
          if (attrs.facetValue.values.length) {
            facetValues.push(attrs.facetValue);
          }
          attrs.facetValues = facetValues;
          delete attrs.facetValue;
        }
        return FacetedSearch.__super__.set.call(this, attrs, options);
      };

      FacetedSearch.prototype.reset = function() {
        this.clear({
          silent: true
        });
        this.set(this.defaults(), {
          silent: true
        });
        this.set(this.queryOptions, {
          silent: true
        });
        return this.trigger('change');
      };

      return FacetedSearch;

    })(Backbone.Model);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/search',['require','models/base'],function(require) {
    var Models, Search, _ref;
    Models = {
      Base: require('models/base')
    };
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.defaults = function() {
        return {
          term: '*',
          caseSensitive: false,
          fuzzy: false,
          title: 'Text search',
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

    })(Models.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/search',['require','config','models/search','views/facets/main','tpls'],function(require) {
    var Models, Search, Views, config, tpls, _ref;
    config = require('config');
    Models = {
      Search: require('models/search')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.initialize = function(options) {
        var _this = this;
        Search.__super__.initialize.apply(this, arguments);
        this.model = new Models.Search(config.textSearchOptions);
        this.listenTo(this.model, 'change', function() {
          return _this.trigger('change', _this.model.queryData());
        });
        return this.render();
      };

      Search.prototype.render = function() {
        var body, menu;
        Search.__super__.render.apply(this, arguments);
        menu = tpls['faceted-search/facets/search.menu']({
          model: this.model
        });
        body = tpls['faceted-search/facets/search.body']({
          model: this.model
        });
        this.$('.options').html(menu);
        this.$('.body').html(body);
        return this;
      };

      Search.prototype.events = function() {
        return _.extend({}, Search.__super__.events.apply(this, arguments), {
          'click button': function(ev) {
            return ev.preventDefault();
          },
          'click button.active': 'search',
          'keyup input': 'activateSearchButton',
          'change input[type="checkbox"]': 'checkboxChanged'
        });
      };

      Search.prototype.checkboxChanged = function(ev) {
        var attr, cb, checkedArray, _i, _len, _ref1;
        if (attr = ev.currentTarget.getAttribute('data-attr')) {
          this.model.set(attr, ev.currentTarget.checked);
        } else if (attr = ev.currentTarget.getAttribute('data-attr-array')) {
          checkedArray = [];
          _ref1 = this.el.querySelectorAll('[data-attr-array="' + attr + '"]');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            cb = _ref1[_i];
            if (cb.checked) {
              checkedArray.push(cb.getAttribute('data-value'));
            }
          }
          this.model.set(attr, checkedArray);
        }
        return this.activateSearchButton(true);
      };

      Search.prototype.activateSearchButton = function(checkboxChanged) {
        var inputValue;
        if (checkboxChanged == null) {
          checkboxChanged = false;
        }
        if (checkboxChanged.hasOwnProperty('target')) {
          checkboxChanged = false;
        }
        inputValue = this.el.querySelector('input[name="search"]').value;
        if (inputValue.length > 1 && (this.model.get('term') !== inputValue || checkboxChanged)) {
          return this.$('button').addClass('active');
        } else {
          return this.$('button').removeClass('active');
        }
      };

      Search.prototype.search = function(ev) {
        var $search, inputValue;
        ev.preventDefault();
        this.$('button').removeClass('active');
        $search = this.$('input[name="search"]');
        $search.addClass('loading');
        inputValue = this.el.querySelector('input[name="search"]').value;
        return this.model.set('term', inputValue);
      };

      Search.prototype.update = function() {
        return this.$('input[name="search"]').removeClass('loading');
      };

      Search.prototype.reset = function() {
        return this.render();
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require.config({
    baseUrl: 'compiled/js',
    paths: {
      'tpls': '../templates',
      'jade': '../lib/jade/runtime',
      'hilib': '../lib/hilib/compiled'
    }
  });

  define('main',['require','hilib/functions/general','hilib/functions/dom','hilib/mixins/pubsub','config','facetviewmap','models/main','views/base','views/search','views/facets/list','views/facets/boolean','views/facets/date','tpls'],function(require) {
    var FacetedSearch, Fn, Models, Views, config, dom, facetViewMap, pubsub, tpls, _ref;
    Fn = require('hilib/functions/general');
    dom = require('hilib/functions/dom');
    pubsub = require('hilib/mixins/pubsub');
    config = require('config');
    facetViewMap = require('facetviewmap');
    Models = {
      FacetedSearch: require('models/main')
    };
    Views = {
      Base: require('views/base'),
      TextSearch: require('views/search'),
      Facets: {
        List: require('views/facets/list'),
        Boolean: require('views/facets/boolean'),
        Date: require('views/facets/date')
      }
    };
    tpls = require('tpls');
    return FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.initialize = function(options) {
        var queryOptions,
          _this = this;
        this.facetViews = {};
        _.extend(this, pubsub);
        _.extend(facetViewMap, options.facetViewMap);
        delete options.facetViewMap;
        _.extend(config.facetNameMap, options.facetNameMap);
        delete options.facetNameMap;
        _.extend(config, options);
        queryOptions = _.extend(config.queryOptions, config.textSearchOptions);
        this.render();
        this.subscribe('change:results', function(responseModel) {
          _this.renderFacets();
          return _this.trigger('results:change', responseModel);
        });
        this.subscribe('change:cursor', function(responseModel) {
          return _this.trigger('results:change', responseModel);
        });
        this.subscribe('change:page', function(responseModel) {
          return _this.trigger('results:change', responseModel);
        });
        this.model = new Models.FacetedSearch(queryOptions);
        this.listenTo(this.model.searchResults, 'request', function() {
          var bb, div, el, loader, top;
          el = _this.el.querySelector('.faceted-search');
          div = _this.el.querySelector('.overlay');
          div.style.width = el.clientWidth + 'px';
          div.style.height = el.clientHeight + 'px';
          div.style.display = 'block';
          loader = _this.el.querySelector('.overlay img');
          bb = dom(el).boundingBox();
          loader.style.left = bb.left + bb.width / 2 + 'px';
          top = bb.height > document.documentElement.clientHeight ? '50vh' : bb.height / 2 + 'px';
          return loader.style.top = top;
        });
        return this.listenTo(this.model.searchResults, 'sync', function() {
          var el;
          el = _this.el.querySelector('.overlay');
          return el.style.display = 'none';
        });
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, textSearch,
          _this = this;
        rtpl = tpls['faceted-search/main']();
        this.$el.html(rtpl);
        this.$('.loader').fadeIn('slow');
        if (config.search) {
          textSearch = new Views.TextSearch();
          this.$('.search-placeholder').html(textSearch.$el);
          this.listenTo(textSearch, 'change', function(queryOptions) {
            return _this.model.set(queryOptions);
          });
          this.facetViews['textSearch'] = textSearch;
        }
        return this;
      };

      FacetedSearch.prototype.renderFacets = function(data) {
        var View, facetData, fragment, index, _ref1,
          _this = this;
        this.$('.loader').hide();
        if (this.model.searchResults.length === 1) {
          fragment = document.createDocumentFragment();
          _ref1 = this.model.searchResults.current.get('facets');
          for (index in _ref1) {
            if (!__hasProp.call(_ref1, index)) continue;
            facetData = _ref1[index];
            if (facetData.type in facetViewMap) {
              View = facetViewMap[facetData.type];
              this.facetViews[facetData.name] = new View({
                attrs: facetData
              });
              this.listenTo(this.facetViews[facetData.name], 'change', function(queryOptions) {
                return _this.model.set(queryOptions);
              });
              fragment.appendChild(this.facetViews[facetData.name].el);
            } else {
              console.error('Unknown facetView', facetData.type);
            }
          }
          return this.el.querySelector('.facets').appendChild(fragment);
        } else {
          return this.update();
        }
      };

      FacetedSearch.prototype.page = function(pagenumber, database) {
        return this.model.searchResults.current.page(pagenumber, database);
      };

      FacetedSearch.prototype.next = function() {
        return this.model.searchResults.moveCursor('_next');
      };

      FacetedSearch.prototype.prev = function() {
        return this.model.searchResults.moveCursor('_prev');
      };

      FacetedSearch.prototype.hasNext = function() {
        return this.model.searchResults.current.has('_next');
      };

      FacetedSearch.prototype.hasPrev = function() {
        return this.model.searchResults.current.has('_prev');
      };

      FacetedSearch.prototype.update = function() {
        var data, index, _ref1, _results;
        if (this.facetViews.hasOwnProperty('textSearch')) {
          this.facetViews.textSearch.update();
        }
        _ref1 = this.model.searchResults.current.get('facets');
        _results = [];
        for (index in _ref1) {
          if (!__hasProp.call(_ref1, index)) continue;
          data = _ref1[index];
          if (data.name === 'textSearch') {
            console.log('ALSO HERE 1');
          }
          _results.push(this.facetViews[data.name].update(data.options));
        }
        return _results;
      };

      FacetedSearch.prototype.reset = function() {
        var data, index, _ref1;
        if (this.facetViews.hasOwnProperty('textSearch')) {
          this.facetViews.textSearch.reset();
        }
        _ref1 = this.model.searchResults.last().get('facets');
        for (index in _ref1) {
          if (!__hasProp.call(_ref1, index)) continue;
          data = _ref1[index];
          if (data.name === 'textSearch') {
            console.log('ALSO HERE 2');
          }
          if (this.facetViews[data.name].reset) {
            this.facetViews[data.name].reset();
          }
        }
        return this.model.reset();
      };

      return FacetedSearch;

    })(Backbone.View);
  });

}).call(this);

    define('jquery', function () { return $; });


    define('underscore', function () { return _; });

    define('backbone', function () { return Backbone; });

    // define('text', function () { return text; });
    // define('helpers/fns', function () { return Fn; });

    // define('managers/ajax', function () { return ajax; });

    return require('main');
}));