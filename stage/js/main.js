(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(['jquery', 'backbone', 'text', 'helpers/fns', 'managers/ajax'], factory);
        // define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.libGlobalName = factory();
    }
}(this, function ($, Backbone, text, Fn, ajax) {
    //almond, and your modules will be inlined here
/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
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

// Generated by CoffeeScript 1.6.2
(function() {
  define('managers/ajax',['require','jquery'],function(require) {
    var $, ajax;

    $ = require('jquery');
    return ajax = (function() {
      function ajax(args) {
        this.baseUrl = args.baseUrl, this.token = args.token;
      }

      ajax.prototype.get = function(args) {
        return this.fire('get', args);
      };

      ajax.prototype.post = function(args) {
        return this.fire('post', args);
      };

      ajax.prototype.put = function(args) {
        return this.fire('put', args);
      };

      ajax.prototype.fire = function(type, args) {
        var ajaxArgs,
          _this = this;

        args.url = this.baseUrl + args.url;
        ajaxArgs = {
          type: type,
          dataType: 'json',
          beforeSend: function(xhr) {
            return xhr.setRequestHeader('Authorization', "SimpleAuth " + _this.token);
          }
        };
        ajaxArgs = $.extend(ajaxArgs, args);
        return $.ajax(ajaxArgs);
      };

      return ajax;

    })();
  });

}).call(this);

// Generated by CoffeeScript 1.6.2
(function() {
  define('managers/pubsub',['require','backbone'],function(require) {
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

  define('models/base',['require','backbone','managers/pubsub'],function(require) {
    var Backbone, Base, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('managers/pubsub');
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

  define('models/main',['require','managers/ajax','models/base'],function(require) {
    var Ajax, FacetedSearch, Models, _ref;
    Ajax = require('managers/ajax');
    Models = {
      Base: require('models/base')
    };
    FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.defaults = function() {
        return {
          url: ''
        };
      };

      FacetedSearch.prototype.query = function(queryData, cb) {
        var ajax, fetchResults, jqXHR,
          _this = this;
        ajax = new Ajax({
          baseUrl: this.get('baseUrl'),
          token: this.get('token')
        });
        fetchResults = function(key) {
          var jqXHR;
          jqXHR = ajax.get({
            url: _this.get('searchUrl') + '/' + key
          });
          return jqXHR.done(cb);
        };
        jqXHR = ajax.post({
          url: this.get('searchUrl'),
          contentType: 'application/json; charset=utf-8',
          processData: false,
          data: JSON.stringify(queryData)
        });
        jqXHR.done(function(data) {
          return fetchResults(data.key);
        });
        return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 401) {
            return _this.publish('unauthorized');
          }
        });
      };

      return FacetedSearch;

    })(Models.Base);
    return new FacetedSearch();
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/base',['require','backbone','managers/pubsub'],function(require) {
    var Backbone, BaseView, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('managers/pubsub');
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

define('text!html/facet.html',[],function () { return '<div class="placeholder pad4"></div>';});

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

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = _.template(Templates.Facet);
        this.$el.html(rtpl);
        return this;
      };

      return Facet;

    })(Views.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/list.item',['require','models/base'],function(require) {
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

      ListItem.prototype.parse = function(attrs) {
        if (!attrs.name) {
          attrs.name = '<i>empty</i>';
        }
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

  define('collections/list.items',['require','models/list.item','collections/base'],function(require) {
    var Collections, ListItems, Models, _ref;
    Models = {
      ListItem: require('models/list.item')
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

      ListItems.prototype.model = Models.ListItem;

      return ListItems;

    })(Collections.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/list',['require','models/base','collections/list.items'],function(require) {
    var Collections, List, Models, _ref;
    Models = {
      Base: require('models/base')
    };
    Collections = {
      ListItems: require('collections/list.items')
    };
    return List = (function(_super) {
      __extends(List, _super);

      function List() {
        _ref = List.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      List.prototype.parse = function(attrs) {
        attrs.options = new Collections.ListItems(attrs.options, {
          parse: true
        });
        return attrs;
      };

      return List;

    })(Models.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('models/facet',['require','models/base'],function(require) {
    var Facet, Models, _ref;
    Models = {
      Base: require('models/base')
    };
    return Facet = (function(_super) {
      __extends(Facet, _super);

      function Facet() {
        _ref = Facet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return Facet;

    })(Models.Base);
  });

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('collections/facets',['require','models/facet','collections/base'],function(require) {
    var Collections, Facets, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    Collections = {
      Base: require('collections/base')
    };
    Facets = (function(_super) {
      __extends(Facets, _super);

      function Facets() {
        _ref = Facets.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Facets.prototype.model = Models.Facet;

      return Facets;

    })(Collections.Base);
    return new Facets();
  });

}).call(this);

define('text!html/facet/list.html',[],function () { return '\n<header>\n  <h3><%= title %></h3>\n</header>\n<div class="body">\n  <div class="row span2 align middle">\n    <div class="cell span1 center">\n      <input type="text" name="listsearch" class="listsearch"/>\n    </div>\n    <div class="cell span1 right">\n      <nav>\n        <ul>\n          <li class="all">All </li>\n          <li class="none">None</li>\n        </ul>\n      </nav>\n    </div>\n  </div>\n  <div class="items">\n    <ul></ul>\n  </div>\n</div>';});

define('text!html/facet/list.items.html',[],function () { return '\n<% _.each(items, function(item) { %>\n<% var someId = generateID(); %>\n<li class="item">\n  <div class="row span6">\n    <div class="cell span5">\n      <input id="<%= someId %>" type="checkbox" name="<%= someId %>"/>\n      <label for="<%= someId %>"><%= item.get(\'name\') %></label>\n    </div>\n    <div class="cell span1 right">\n      <div class="count"><%= item.get(\'count\') %></div>\n    </div>\n  </div>\n</li><% }); %>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/facets/list',['require','helpers/fns','views/facet','models/list','collections/facets','text!html/facet/list.html','text!html/facet/list.items.html'],function(require) {
    var Collections, Fn, ListFacet, Models, Templates, Views, _ref;
    Fn = require('helpers/fns');
    Views = {
      Facet: require('views/facet')
    };
    Models = {
      List: require('models/list')
    };
    Collections = {
      Facets: require('collections/facets')
    };
    Templates = {
      List: require('text!html/facet/list.html'),
      Items: require('text!html/facet/list.items.html')
    };
    return ListFacet = (function(_super) {
      __extends(ListFacet, _super);

      function ListFacet() {
        _ref = ListFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListFacet.prototype.filtered_items = [];

      ListFacet.prototype.className = 'facet list';

      ListFacet.prototype.events = function() {
        return {
          'click li.all': 'selectAll',
          'click li.none': 'deselectAll',
          'click h3': 'toggleBody',
          'keyup input.listsearch': 'showResults'
        };
      };

      ListFacet.prototype.toggleBody = function(ev) {
        console.log($(ev.currentTarget).parents('.list'));
        return $(ev.currentTarget).parents('.list').find('.body').slideToggle();
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

      ListFacet.prototype.showResults = function(ev) {
        var re, value;
        value = ev.currentTarget.value;
        re = new RegExp(value, 'i');
        this.filtered_items = this.model.get('options').filter(function(item) {
          return re.test(item.get('name'));
        });
        return this.renderListItems();
      };

      ListFacet.prototype.initialize = function(options) {
        ListFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.List(options.attrs, {
          parse: true
        });
        return this.render();
      };

      ListFacet.prototype.render = function() {
        var rtpl;
        ListFacet.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.List, this.model.attributes);
        this.$('.placeholder').html(rtpl);
        this.renderListItems();
        return this;
      };

      ListFacet.prototype.renderListItems = function() {
        var items, rtpl;
        items = this.filtered_items.length > 0 ? this.filtered_items : this.model.get('options').models;
        rtpl = _.template(Templates.Items, {
          model: this.model.attributes,
          items: items,
          generateID: Fn.generateID
        });
        return this.$('.body .items ul').html(rtpl);
      };

      return ListFacet;

    })(Views.Facet);
  });

}).call(this);

define('text!html/search.html',[],function () { return '<header><h3>Text search</h3></header><div class="body"><div class="row span4 align middle"><div class="cell span3"><div class="padr4"><input id="search" type="text" name="search"/></div></div><div class="cell span1"><button class="search">Search</button></div></div><br/><div class="align middle"><input id="matchcase" type="checkbox" name="matchcase"/><label for="matchcase">Match case</label></div></div>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('views/search',['require','models/main','views/facet','text!html/search.html'],function(require) {
    var Models, Search, Templates, Views, _ref;
    Models = {
      Main: require('models/main')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Search: require('text!html/search.html')
    };
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.events = {
        'click button.search': 'search'
      };

      Search.prototype.search = function(ev) {
        var _this = this;
        ev.preventDefault();
        this.$('#search').addClass('loading');
        return this.model.query({
          term: this.$('input#search').val(),
          textLayers: ['Diplomatic']
        }, function(results) {
          _this.$('#search').removeClass('loading');
          return _this.publish('faceted-search:results', results);
        });
      };

      Search.prototype.initialize = function() {
        Search.__super__.initialize.apply(this, arguments);
        this.model = Models.Main;
        return this.render();
      };

      Search.prototype.render = function() {
        var rtpl;
        Search.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.Search);
        this.$('.placeholder').html(rtpl);
        return this;
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);

define('text!html/faceted-search.html',[],function () { return '<form></form>';});

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define('main',['require','models/main','views/base','views/facets/list','views/search','text!html/faceted-search.html'],function(require) {
    var FacetedSearch, Models, Templates, Views, _ref;
    Models = {
      Main: require('models/main')
    };
    Views = {
      Base: require('views/base'),
      List: require('views/facets/list'),
      Search: require('views/search')
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

      FacetedSearch.prototype.className = 'faceted-search';

      FacetedSearch.prototype.defaultOptions = function() {
        return {
          search: true
        };
      };

      FacetedSearch.prototype.initialize = function(options) {
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.options = _.extend(this.defaultOptions(), options);
        this.model = Models.Main;
        this.model.set('baseUrl', this.options.baseUrl);
        this.model.set('searchUrl', this.options.searchUrl);
        this.model.set('token', this.options.token);
        return this.render();
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, search,
          _this = this;
        rtpl = _.template(Templates.FacetedSearch);
        this.$el.html(rtpl);
        if (this.options.search) {
          search = new Views.Search();
          this.$('form').html(search.$el);
        }
        this.model.query({}, function(data) {
          _this.facets = data.facets;
          return _this.renderFacets();
        });
        return this;
      };

      FacetedSearch.prototype.renderFacets = function() {
        var data, index, list, _ref1, _results;
        _ref1 = this.facets;
        _results = [];
        for (index in _ref1) {
          if (!__hasProp.call(_ref1, index)) continue;
          data = _ref1[index];
          list = new Views.List({
            attrs: data
          });
          _results.push(this.$('form').append(list.$el));
        }
        return _results;
      };

      return FacetedSearch;

    })(Views.Base);
  });

}).call(this);
    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    // console.log(require('views/main'))
    define('jquery', function () { return $; });
    
    // define('underscore', function () {
    //     return _;
    // });

    define('text', function() { return text; });

    define('backbone', function () { return Backbone; });

    define('helpers/fns', function() { return Fn; })

    define('managers/ajax', function() { return ajax; })

    // console.log(require('main'))
    // return 'toet';
    return require('main');
}));