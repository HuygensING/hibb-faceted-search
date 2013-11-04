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
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
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
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

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

            ret = callback.apply(defined[name], args);

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
        return arr.splice(index, 1);
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
        var scrolledLeft, scrolledTop, totalLeft, totalTop;
        scrolledTop = el.scrollTop;
        totalTop = el.scrollHeight - el.clientHeight;
        scrolledLeft = el.scrollLeft;
        totalLeft = el.scrollWidth - el.clientWidth;
        return {
          top: Math.floor((scrolledTop / totalTop) * 100),
          left: Math.floor((scrolledLeft / totalLeft) * 100)
        };
      },
      setScrollPercentage: function(el, percentages) {
        var clientHeight, clientWidth, scrollHeight, scrollWidth;
        clientWidth = el.clientWidth;
        scrollWidth = el.scrollWidth;
        clientHeight = el.clientHeight;
        scrollHeight = el.scrollHeight;
        el.scrollTop = (scrollHeight - clientHeight) * percentages.top / 100;
        return el.scrollLeft = (scrollWidth - clientWidth) * percentages.left / 100;
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
      }
    };
  });

}).call(this);

(function() {
  define('hilib/mixins/pubsub',['require','backbone'],function(require) {
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
      	
      	Example: "There are 12 monkeys." => "12"
      	
      	return String
      */

      onlyNumbers: function(str) {
        return str.replace(/[^\d.]/g, '');
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

/**
 * @license RequireJS text 2.0.10 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    text = {
        version: '2.0.10',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file.indexOf('\uFEFF') === 0) {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                errback(e);
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes,
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});

define('text!html/facet.html',[],function () { return '<div class="placeholder pad4"><header><h3 data-name="<%= name %>"><%= title %></h3><small>&#8711;</small><div class="options"></div></header><div class="body"></div></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facet',['require','views/base','text!html/facet.html'],function(require) {
    var Facet, Templates, Views, _ref;
    Views = {
      Base: require('views/base')
    };
    Templates = {
      Facet: require('text!html/facet.html')
    };
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
          'click header small': 'toggleOptions'
        };
      };

      Facet.prototype.toggleOptions = function(ev) {
        this.$('header small').toggleClass('active');
        this.$('header .options').slideToggle();
        return this.$('.options .listsearch').focus();
      };

      Facet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = _.template(Templates.Facet, this.model.attributes);
        this.$el.html(rtpl);
        return this;
      };

      Facet.prototype.update = function(newOptions) {};

      return Facet;

    })(Views.Base);
  });

}).call(this);

define('text!html/facet/boolean.body.html',[],function () { return '<div class="options"><ul><% _.each(options, function(option) { %><li class="option"><div class="row span6"><div class="cell span5"><input id="<%= name %>_<%= option.name %>" name="<%= name %>_<%= option.name %>" type="checkbox" data-value="<%= option.name %>"><label for="<%= name %>_<%= option.name %>"><%= ucfirst(option.name) %></label></div><div class="cell span1 alignright"><div class="count"><%= option.count %></div></div></div></li><% }); %></ul></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/boolean',['require','hilib/functions/string','models/boolean','views/facet','text!html/facet/boolean.body.html'],function(require) {
    var BooleanFacet, Models, StringFn, Templates, Views, _ref;
    StringFn = require('hilib/functions/string');
    Models = {
      Boolean: require('models/boolean')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Body: require('text!html/facet/boolean.body.html')
    };
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
        rtpl = _.template(Templates.Body, _.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.body').html(rtpl);
        this.$('header small').hide();
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

define('text!html/facet/date.html',[],function () { return '<header><h3 data-name="<%= name %>"><%= title %></h3></header><div class="body"><label>From:</label><select><% _.each(options, function(option) { %><option><%= option %></option><% }); %></select><label>To:</label><select><% _.each(options.reverse(), function(option) { %><option><%= option %></option><% }); %></select></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/date',['require','hilib/functions/string','models/date','views/facet','text!html/facet/date.html'],function(require) {
    var DateFacet, Models, StringFn, Templates, Views, _ref;
    StringFn = require('hilib/functions/string');
    Models = {
      Date: require('models/date')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Date: require('text!html/facet/date.html')
    };
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
        rtpl = _.template(Templates.Date, _.extend(this.model.attributes, {
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

      ListItems.prototype.parse = function(attrs) {
        return attrs;
      };

      ListItems.prototype.comparator = function(model) {
        return -1 * parseInt(model.get('count'), 10);
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
          return opt.set('count', newOption.count, {
            silent: true
          });
        });
        return this.sort();
      };

      return ListItems;

    })(Collections.Base);
  });

}).call(this);

define('text!html/facet/list.options.html',[],function () { return '<ul><% _.each(options, function(option) { %>\n<% var randomId = generateID(); %>\n<% var checked = (option.get(\'checked\')) ? \'checked\' : \'\'; %>\n<% var count = (option.get(\'count\') === 0) ? option.get(\'total\') : option.get(\'count\'); %>\n<% var labelText = (option.id === \':empty\') ? \'<i>(empty)</i>\' : option.id %><li class="option"><div data-count="<%= option.get(\'count\') %>" class="row span6"><div class="cell span5"><input id="<%= randomId %>" name="<%= randomId %>" type="checkbox" data-value="<%= option.id %>" <%= checked %>><label for="<%= randomId %>"><%= labelText %></label></div><div class="cell span1 alignright"><div class="count"><%= count %></div></div></div></li><% }); %></ul>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/list.options',['require','hilib/functions/general','views/base','models/list','text!html/facet/list.options.html'],function(require) {
    var Fn, ListOptions, Models, Templates, Views, _ref;
    Fn = require('hilib/functions/general');
    Views = {
      Base: require('views/base')
    };
    Models = {
      List: require('models/list')
    };
    Templates = {
      Options: require('text!html/facet/list.options.html')
    };
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
        rtpl = _.template(Templates.Options, {
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

define('text!html/facet/list.menu.html',[],function () { return '<div class="row span4 align middle"><div class="cell span2"><input type="text" name="listsearch" class="listsearch"/></div><div class="cell span1"><small class="optioncount"></small></div><div class="cell span1 alignright"><nav><ul><li class="all">All </li><li class="none">None</li></ul></nav></div></div>';});

define('text!html/facet/list.body.html',[],function () { return '<div class="options"><ul></ul></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/list',['require','hilib/functions/general','models/list','collections/list.options','views/facet','views/facets/list.options','text!html/facet/list.menu.html','text!html/facet/list.body.html'],function(require) {
    var Collections, Fn, ListFacet, Models, Templates, Views, _ref;
    Fn = require('hilib/functions/general');
    Models = {
      List: require('models/list')
    };
    Collections = {
      Options: require('collections/list.options')
    };
    Views = {
      Facet: require('views/facet'),
      Options: require('views/facets/list.options')
    };
    Templates = {
      Menu: require('text!html/facet/list.menu.html'),
      Body: require('text!html/facet/list.body.html')
    };
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
          'keyup input.listsearch': function(ev) {
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
        menu = _.template(Templates.Menu, this.model.attributes);
        body = _.template(Templates.Body, this.model.attributes);
        this.$('.options').html(menu);
        this.$('.body').html(body);
        options = new Collections.Options(this.options.attrs.options, {
          parse: true
        });
        this.optionsView = new Views.Options({
          el: this.$('.body .options'),
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
          this.$('header .options .listsearch').addClass('nonefound');
          this.$('header small.optioncount').html('');
        } else {
          this.$('header .options .listsearch').removeClass('nonefound');
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
  define('hilib/managers/ajax',['require','jquery'],function(require) {
    var $, defaultOptions;
    $ = require('jquery');
    $.support.cors = true;
    defaultOptions = {
      token: true
    };
    return {
      token: null,
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
        if ((this.token != null) && options.token) {
          ajaxArgs.beforeSend = function(xhr) {
            return xhr.setRequestHeader('Authorization', "SimpleAuth " + _this.token);
          };
        }
        return $.ajax($.extend(ajaxArgs, args));
      }
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

      Token.prototype.set = function(token) {
        this.token = token;
        return sessionStorage.setItem('huygens_token', token);
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
        return sessionStorage.removeItem('huygens_token');
      };

      return Token;

    })();
    return new Token();
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/searchresult',['require','hilib/managers/ajax','hilib/managers/token','config','models/base'],function(require) {
    var Models, SearchResult, ajax, config, token, _ref;
    ajax = require('hilib/managers/ajax');
    token = require('hilib/managers/token');
    config = require('config');
    Models = {
      Base: require('models/base')
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

      SearchResult.prototype.sync = function(method, model, options) {
        var jqXHR,
          _this = this;
        if (method === 'read') {
          if (options.url != null) {
            return this.getResults(options.url, options.success);
          } else {
            ajax.token = config.token;
            jqXHR = ajax.post({
              url: config.baseUrl + config.searchPath,
              data: options.data,
              dataType: 'text'
            });
            jqXHR.done(function(data, textStatus, jqXHR) {
              var url;
              if (jqXHR.status === 201) {
                url = jqXHR.getResponseHeader('Location');
                if (_this.resultRows != null) {
                  url += '?rows=' + _this.resultRows;
                }
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
          return console.error('Failed getting FacetedSearch results from the server!');
        });
      };

      return SearchResult;

    })(Models.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/searchresults',['require','hilib/mixins/pubsub','models/searchresult'],function(require) {
    var SearchResult, SearchResults, pubsub, _ref;
    pubsub = require('hilib/mixins/pubsub');
    SearchResult = require('models/searchresult');
    return SearchResults = (function(_super) {
      __extends(SearchResults, _super);

      function SearchResults() {
        _ref = SearchResults.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SearchResults.prototype.model = SearchResult;

      SearchResults.prototype.initialize = function() {
        _.extend(this, pubsub);
        this.currentQueryOptions = null;
        this.cachedModels = {};
        return this.on('add', this.setCurrent, this);
      };

      SearchResults.prototype.setCurrent = function(model) {
        this.current = model;
        return this.publish('change:results', model, this.currentQueryOptions);
      };

      SearchResults.prototype.runQuery = function(currentQueryOptions) {
        var data, resultRows, searchResult,
          _this = this;
        this.currentQueryOptions = currentQueryOptions;
        if (this.currentQueryOptions.hasOwnProperty('resultRows')) {
          resultRows = this.currentQueryOptions.resultRows;
          delete this.currentQueryOptions.resultRows;
        }
        data = JSON.stringify(this.currentQueryOptions);
        if (this.cachedModels.hasOwnProperty(data)) {
          return this.setCurrent(this.cachedModels[data]);
        } else {
          searchResult = new SearchResult();
          if (resultRows != null) {
            searchResult.resultRows = resultRows;
          }
          return searchResult.fetch({
            data: data,
            success: function(model, response, options) {
              _this.cachedModels[data] = model;
              return _this.add(model);
            }
          });
        }
      };

      SearchResults.prototype.moveCursor = function(direction) {
        var searchResult, url,
          _this = this;
        if (url = this.current.get(direction)) {
          if (this.cachedModels.hasOwnProperty(url)) {
            return this.setCurrent(this.cachedModels[url]);
          } else {
            searchResult = new SearchResult();
            return searchResult.fetch({
              url: url,
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
          searchOptions: {
            term: '*',
            caseSensitive: false
          }
        };
      };

      return Search;

    })(Models.Base);
  });

}).call(this);

define('text!html/facet/search.menu.html',[],function () { return '<div class="row span1 align middle"><div class="cell span1 casesensitive"><input id="cb_casesensitive" type="checkbox" name="cb_casesensitive" data-prop="caseSensitive"/><label for="cb_casesensitive">Match case</label></div></div><% if (\'searchInAnnotations\' in searchOptions || \'searchInTranscriptions\' in searchOptions) { %>\n<% cb_searchin_annotations_checked = (\'searchInAnnotations\' in searchOptions && searchOptions.searchInAnnotations) ? \' checked \' : \'\' %>\n<% cb_searchin_transcriptions_checked = (\'searchInTranscriptions\' in searchOptions && searchOptions.searchInTranscriptions) ? \' checked \' : \'\' %><div class="row span1"><div class="cell span1"><h4>Search in</h4><ul class="searchins"><% if (\'searchInAnnotations\' in searchOptions) { %><li class="searchin"><input id="cb_searchin_annotations" type="checkbox" data-prop="searchInAnnotations"<%= cb_searchin_annotations_checked %>><label for="cb_searchin_annotations">Annotations</label></li><% } %>\n<% if (\'searchInTranscriptions\' in searchOptions) { %><li class="searchin"><input id="cb_searchin_transcriptions" type="checkbox" data-prop="searchInTranscriptions"<%= cb_searchin_transcriptions_checked %>><label for="cb_searchin_transcriptions">Transcriptions</label></li><% } %></ul></div></div><% } %>\n<% if (\'textLayers\' in searchOptions) { %><div class="row span1"><div class="cell span1"><h4>Text layers</h4><ul class="textlayers"><% _.each(searchOptions.textLayers, function(tl) { %><li class="textlayer"><input id="cb_textlayer_<%= tl %>" type="checkbox" data-proparr="textLayers"/><label for="cb_textlayer_<%= tl %>"><%= tl %></label></li><% }); %></ul></div></div><% } %>';});

define('text!html/facet/search.body.html',[],function () { return '<div class="row span4 align middle"><div class="cell span3"><div class="padr4"><input id="search" type="text" name="search"/></div></div><div class="cell span1"><button class="search">Search</button></div></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/search',['require','config','models/search','views/facet','text!html/facet/search.menu.html','text!html/facet/search.body.html'],function(require) {
    var Models, Search, Templates, Views, config, _ref;
    config = require('config');
    Models = {
      Search: require('models/search')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Menu: require('text!html/facet/search.menu.html'),
      Body: require('text!html/facet/search.body.html')
    };
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.initialize = function(options) {
        Search.__super__.initialize.apply(this, arguments);
        this.currentSearchText = null;
        this.model = new Models.Search({
          searchOptions: config.textSearchOptions,
          title: 'Text search',
          name: 'text_search'
        });
        return this.render();
      };

      Search.prototype.render = function() {
        var body, checkboxes, menu,
          _this = this;
        Search.__super__.render.apply(this, arguments);
        menu = _.template(Templates.Menu, this.model.attributes);
        body = _.template(Templates.Body, this.model.attributes);
        this.$('.options').html(menu);
        this.$('.body').html(body);
        checkboxes = this.$(':checkbox');
        checkboxes.change(function(ev) {
          return _.each(checkboxes, function(cb) {
            var checked, prop;
            prop = cb.getAttribute('data-prop');
            if (prop != null) {
              checked = $(cb).attr('checked') === 'checked' ? true : false;
              return _this.model.set(prop, checked);
            }
          });
        });
        return this;
      };

      Search.prototype.events = function() {
        return _.extend({}, Search.__super__.events.apply(this, arguments), {
          'click button': function(ev) {
            return ev.preventDefault();
          },
          'click button.active': 'search',
          'keyup input': 'onKeyup'
        });
      };

      Search.prototype.onKeyup = function(ev) {
        if (ev.currentTarget.value.length > 1 && this.currentSearchText !== ev.currentTarget.value) {
          return this.$('button').addClass('active');
        } else {
          return this.$('button').removeClass('active');
        }
      };

      Search.prototype.search = function(ev) {
        var $search;
        ev.preventDefault();
        this.$('button').removeClass('active');
        $search = this.$('#search');
        $search.addClass('loading');
        this.currentSearchText = $search.val();
        return this.trigger('change', {
          term: this.currentSearchText
        });
      };

      Search.prototype.update = function() {
        return this.$('#search').removeClass('loading');
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);

define('text!html/faceted-search.html',[],function () { return '<div class="faceted-search"><form><div class="search-placeholder"></div><div class="facets"><div class="loader"><h4>Loading facets...</h4><br/><img src="../images/faceted-search/loader.gif"/></div></div></form></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('main',['require','hilib/functions/general','hilib/mixins/pubsub','config','facetviewmap','models/main','views/base','views/search','views/facets/list','views/facets/boolean','views/facets/date','text!html/faceted-search.html'],function(require) {
    var FacetedSearch, Fn, Models, Templates, Views, config, facetViewMap, pubsub, _ref;
    Fn = require('hilib/functions/general');
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
    Templates = {
      FacetedSearch: require('text!html/faceted-search.html')
    };
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
        this.subscribe('unauthorized', function() {
          return _this.trigger('unauthorized');
        });
        this.subscribe('change:results', function(responseModel, queryOptions) {
          _this.renderFacets();
          return _this.trigger('results:change', responseModel, queryOptions);
        });
        return this.model = new Models.FacetedSearch(queryOptions);
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, textSearch,
          _this = this;
        rtpl = _.template(Templates.FacetedSearch);
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
        var View, facetData, fragment, index, _ref1, _ref2, _results,
          _this = this;
        this.$('.loader').hide();
        if (this.model.searchResults.length === 1) {
          fragment = document.createDocumentFragment();
          _ref1 = this.model.searchResults.last().get('facets');
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
          return this.$('.facets').html(fragment);
        } else {
          if (this.facetViews.hasOwnProperty('textSearch')) {
            this.facetViews['textSearch'].update();
          }
          _ref2 = this.model.searchResults.facets;
          _results = [];
          for (index in _ref2) {
            if (!__hasProp.call(_ref2, index)) continue;
            data = _ref2[index];
            _results.push(this.facetViews[data.name].update(data.options));
          }
          return _results;
        }
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

      FacetedSearch.prototype.reset = function() {
        var data, index, _ref1;
        _ref1 = this.model.searchResults.last().get('facets');
        for (index in _ref1) {
          if (!__hasProp.call(_ref1, index)) continue;
          data = _ref1[index];
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