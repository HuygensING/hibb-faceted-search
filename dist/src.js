(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FacetedSearch = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var $, Backbone, BooleanFacet, Config, Facets, ListFacet, MainView, QueryOptions, Results, SearchResults, TextSearch, _, assert, funcky, tpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp1.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp1 = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

Backbone.$ = $;

assert = _dereq_('assert');

_ = _dereq_('underscore');

funcky = _dereq_('funcky.el').el;

Config = _dereq_('./models/config');

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

MainView = (function(superClass) {
  extend(MainView, superClass);

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

  MainView.prototype.initialize = function(options1) {
    var configOptions;
    this.options = options1 != null ? options1 : {};
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
    this.listenTo(this.results, 'change:sort-levels', function(sortParameters) {
      return this.sortResultsBy(sortParameters);
    });
    return this.listenTo(this.results, "render:finished", (function(_this) {
      return function() {
        return _this.trigger("results:render:finished");
      };
    })(this));
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
      facetDisplayNames: null,
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
    var attrs, i, len, level, ref;
    attrs = this.config.get('queryOptions');
    if (this.textSearch != null) {
      attrs = _.extend(this.config.get('queryOptions'), this.textSearch.model.attributes);
      delete attrs.term;
    }
    if (this.config.get('levels').length > 0) {
      attrs.sortParameters = [];
      ref = this.config.get('levels');
      for (i = 0, len = ref.length; i < len; i++) {
        level = ref[i];
        attrs.sortParameters.push({
          fieldname: level,
          direction: "asc"
        });
      }
    }
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
        return _this.config.handleFirstResponseModel(responseModel);
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
    var i, len, param, resultFields;
    resultFields = ['id'];
    for (i = 0, len = sortParameters.length; i < len; i++) {
      param = sortParameters[i];
      if (param.fieldname !== "") {
        resultFields.push(param.fieldname);
      }
    }
    return this.queryOptions.set({
      sortParameters: sortParameters,
      resultFields: resultFields
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
    var attrs;
    attrs = this.queryOptions.attributes;
    if (attrs.caseSensitive === null) {
      delete attrs.caseSensitive;
    }
    return this.searchResults.runQuery(attrs, options);
  };


  /*
  	 * Set a single option in a list or boolean facet and perform a search.
  	 *
  	 * Equivalent to a user resetting the faceted search and selecting one value.
  	 * This is only usable for LIST and BOOLEAN facets.
  	 *
  	 * @method
  	 * @param {String} facetName
  	 * @param values
   */

  MainView.prototype.searchValue = function(facetName, values) {
    var hasProp, i, isBooleanFacet, isListFacet, len, value;
    if (typeof values === 'string') {
      values = [values];
    }
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
    this.reset(true);
    this.facets.views[facetName].collection.revert();
    for (i = 0, len = values.length; i < len; i++) {
      value = values[i];
      this.facets.views[facetName].collection.get(value).set({
        checked: true,
        visible: true
      });
    }
    this.queryOptions.reset();
    return this.refresh({
      facetValues: [
        {
          name: facetName,
          values: values
        }
      ]
    });
  };

  MainView.prototype.currentResult = function() {
    return this.searchResults.getCurrent();
  };

  return MainView;

})(Backbone.View);

module.exports = MainView;



},{"../jade/main.jade":46,"./collections/searchresults":13,"./models/config":14,"./models/query-options":17,"./views/facets":20,"./views/facets/boolean":21,"./views/facets/list":23,"./views/results":36,"./views/text-search":42,"assert":2,"backbone":undefined,"funcky.el":8,"jquery":undefined,"underscore":undefined}],2:[function(_dereq_,module,exports){
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
  if (util.isNumber(value) && !isFinite(value)) {
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
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
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

},{"util/":7}],3:[function(_dereq_,module,exports){

},{}],4:[function(_dereq_,module,exports){
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

},{}],5:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

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
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(_dereq_,module,exports){
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

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":6,"_process":5,"inherits":4}],8:[function(_dereq_,module,exports){
(function() {
  module.exports = {
    el: function(el) {
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

},{}],9:[function(_dereq_,module,exports){
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
        if (xhr.readyState === 4) {
          if (promise.callAlways != null) {
            promise.callAlways(xhr);
          }
          if ((200 <= (_ref = xhr.status) && _ref <= 206) || xhr.status === 1223) {
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

},{}],10:[function(_dereq_,module,exports){
(function(){module.exports={generateID:function(t){var n,r;for(t=null!=t&&t>0?t-1:7,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=n.charAt(Math.floor(52*Math.random()));t--;)r+=n.charAt(Math.floor(Math.random()*n.length));return r},setResetTimeout:function(){var t;return t=null,function(n,r,e){return null!=t&&(null!=e&&e(),clearTimeout(t)),t=setTimeout(function(){return t=null,r()},n)}}()}}).call(this);
},{}],11:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pagination = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var $, Backbone, Pagination, tpl, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

Backbone.$ = $;

util = _dereq_('funcky.util');

tpl = _dereq_('./main.jade');


/*
Create a pagination view.
@class
@extends Backbone.View
 */

Pagination = (function(superClass) {
  extend(Pagination, superClass);

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
  	@prop {array<String>} [options.showPageNames] - Show `1 page of 23 pages` instead of `1 of 23`. Array contains the singular and plural version, ie: ["page", "pages"]
   */

  Pagination.prototype.initialize = function(options) {
    var base, base1;
    this.options = options != null ? options : {};
    if ((base = this.options).step10 == null) {
      base.step10 = true;
    }
    if ((base1 = this.options).triggerPageNumber == null) {
      base1.triggerPageNumber = true;
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



},{"./main.jade":5,"backbone":undefined,"funcky.util":3,"jquery":undefined}],2:[function(_dereq_,module,exports){

},{}],3:[function(_dereq_,module,exports){
(function(){module.exports={generateID:function(t){var n,r;for(t=null!=t&&t>0?t-1:7,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=n.charAt(Math.floor(52*Math.random()));t--;)r+=n.charAt(Math.floor(Math.random()*n.length));return r},setResetTimeout:function(){var t;return t=null,function(n,r,e){return null!=t&&(null!=e&&e(),clearTimeout(t)),t=setTimeout(function(){return t=null,r()},n)}}()}}).call(this);
},{}],4:[function(_dereq_,module,exports){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fs":2}],5:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (currentPageNumber, pageCount, showPageNames, step10) {
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
}}.call(this,"currentPageNumber" in locals_for_with?locals_for_with.currentPageNumber:typeof currentPageNumber!=="undefined"?currentPageNumber:undefined,"pageCount" in locals_for_with?locals_for_with.pageCount:typeof pageCount!=="undefined"?pageCount:undefined,"showPageNames" in locals_for_with?locals_for_with.showPageNames:typeof showPageNames!=="undefined"?showPageNames:undefined,"step10" in locals_for_with?locals_for_with.step10:typeof step10!=="undefined"?step10:undefined));;return buf.join("");
};
},{"jade/runtime":4}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(_dereq_,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jade = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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

var jade_encode_html_rules = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};
var jade_match_html = /[&<>"]/g;

function jade_encode_char(c) {
  return jade_encode_html_rules[c] || c;
}

exports.escape = jade_escape;
function jade_escape(html){
  var result = String(html).replace(jade_match_html, jade_encode_char);
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

exports.DebugItem = function DebugItem(lineno, filename) {
  this.lineno = lineno;
  this.filename = filename;
}

},{"fs":2}],2:[function(_dereq_,module,exports){

},{}]},{},[1])(1)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"fs":3}],13:[function(_dereq_,module,exports){
var Backbone, SearchResult, SearchResults, _, funcky,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

SearchResult = _dereq_('../models/searchresult');

funcky = _dereq_('funcky.req');


/*
 * @class
 * @namespace Collections
 * @uses SearchResult
 */

SearchResults = (function(superClass) {
  extend(SearchResults, superClass);

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

  SearchResults.prototype._cachedModels = null;


  /*
  	 * @construct
  	 * @param {Array<SearchResult>} models
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
   */

  SearchResults.prototype.initialize = function(models, options1) {
    this.options = options1;
    return this._cachedModels = {};
  };


  /*
  	 * @method
   */

  SearchResults.prototype.clearCache = function() {
    return this._cachedModels = {};
  };


  /*
  	 * Get the current result.
  	 *
  	 * This is not equivalent to @last()! The current result can also be a
  	 * cached result, which does not have to be the last.
  	 *
  	 * @method
   */

  SearchResults.prototype.getCurrent = function() {
    return this._current;
  };


  /*
  	 * Set the current result.
  	 *
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
    this._cachedModels[cacheId] = new this.model(attrs);
    this.add(this._cachedModels[cacheId]);
    return this._setCurrent(this._cachedModels[cacheId], changeMessage);
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
    if (options.cache && this._cachedModels.hasOwnProperty(queryOptionsString)) {
      return this._setCurrent(this._cachedModels[queryOptionsString], changeMessage);
    } else {
      return this.postQuery(queryOptions, (function(_this) {
        return function(url) {
          var getUrl;
          getUrl = url + "?rows=" + (_this.options.config.get('resultRows'));
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
      if (this._cachedModels.hasOwnProperty(url)) {
        return this._setCurrent(this._cachedModels[url], changeMessage);
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
    if (this._cachedModels.hasOwnProperty(url)) {
      return this._setCurrent(this._cachedModels[url], changeMessage);
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
        } else {
          throw new Error("Server should return status: 201.", res);
        }
      };
    })(this));
    return req.fail((function(_this) {
      return function(res) {
        console.log(res);
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



},{"../models/searchresult":19,"backbone":undefined,"funcky.req":9,"underscore":undefined}],14:[function(_dereq_,module,exports){
var Backbone, Config, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 * @todo Move to ./models
 */

Config = (function(superClass) {
  extend(Config, superClass);

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
  	 * @param {Object} [facetDisplayNames={}] Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
  	 * @param {Array<String>} [facetOrder=[]] Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
  	 * @param {Object} [parsers={}] Hash of parser functions. Takes the options from the result and parses the options before rendering. Use sparsely, because with large option lists, the perfomance penalty can become great.
  	 * @param {Boolean} [collapsed=false] collapsed Start the faceted search with the facets collapsed.
  	 *
  	 * RESULTS OPTIONS
  	 * @param {Boolean} [results=false] Render the results. When kept to false, the showing of the results has to be taken care of in the application.
  	 * @param {Boolean} [sortLevels=true] Render sort levels in the results header
  	 * @param {Boolean} [showMetadata=true] Render show metadata toggle in the results header
  	 * @param {Boolean} [showPageNames] Show `page 1 of 23 pages` instead of `1 of 23`.
  	 *
  	 * OTHER RENDERING OPTIONS
  	 * @param {Object} [templates={}] Hash of templates. The templates should be functions which take a hash as argument to render vars. Possible keys: main, facets, text-search, facets.main, list.menu, list.body, range.body and result.
  	 * @param {Object} [templateData={}] Hash of template data. The same property names as with templates can be used. The data is passed to the corresponding template.
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
      queryOptions: {
        facetValues: []
      },
      requestOptions: {},
      entryMetadataFields: [],
      levelDisplayNames: {},
      levels: [],
      initLevels: {},

      /* FACETS OPTIONS */
      textSearch: 'advanced',
      textSearchOptions: {
        caseSensitive: false,
        fuzzy: false
      },
      autoSearch: true,
      facetDisplayNames: {},
      facetOrder: [],
      parsers: {},
      collapse: false,

      /* RESULTS OPTIONS */
      results: false,
      sortLevels: true,
      showMetadata: true,
      showPageNames: null,

      /* OTHER RENDERING OPTIONS */
      templates: {},
      templateData: {},
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


  /*
  	 * Communication with the server relies on the facets field name. But the UI
  	 * has to show the displayName. There are three ways to retrieve the displayName.
  	 * First: get from the levelDisplayNames
  	 * Second: get from the facetDisplayNames
  	 * Third: get from the facetData returned in the first responseModel
  	 *
  	 * @method
  	 * @param {Object} responseModel
   */

  Config.prototype.handleFirstResponseModel = function(responseModel) {
    var fieldMap, initLevelMap, levelMap, textSearchOptions;
    textSearchOptions = _.clone(this.get('textSearchOptions'));
    if (responseModel.has('fullTextSearchFields')) {
      textSearchOptions.fullTextSearchParameters = responseModel.get('fullTextSearchFields');
    } else {
      textSearchOptions.term = "";
      if (this.has('textLayers')) {
        textSearchOptions.textLayers = this.get('textLayers');
      }
    }
    this.set({
      textSearchOptions: textSearchOptions
    });
    if (Object.keys(this.get('levelDisplayNames')).length > 0) {
      initLevelMap = this._createDisplayNameMapFromMap('levels', this.get('levelDisplayNames'));
      levelMap = this._createLevelMapFromMap(responseModel.get('sortableFields'), this.get('levelDisplayNames'));
    } else if (Object.keys(this.get('facetDisplayNames')).length > 0) {
      initLevelMap = this._createDisplayNameMapFromMap('levels', this.get('facetDisplayNames'));
      levelMap = this._createLevelMapFromMap(responseModel.get('sortableFields'), this.get('facetDisplayNames'));
    } else {
      initLevelMap = this._createDisplayNameMapFromFacetData('levels', responseModel.get('facets'));
      levelMap = this._createLevelMapFromFacetData(responseModel.get('sortableFields'), responseModel.get('facets'));
    }
    if (Object.keys(this.get('facetDisplayNames')).length > 0) {
      fieldMap = this._createDisplayNameMapFromMap('entryMetadataFields', this.get('facetDisplayNames'));
    } else {
      fieldMap = this._createDisplayNameMapFromFacetData('entryMetadataFields', responseModel.get('facets'));
    }
    this.set({
      entryMetadataFields: fieldMap
    });
    this.set({
      levels: levelMap
    });
    return this.set({
      initLevels: initLevelMap
    });
  };


  /*
  	 * @method
   */

  Config.prototype._createLevelMapFromMap = function(sortableFields, map) {
    var field, k, len, levelMap;
    levelMap = {};
    for (k = 0, len = sortableFields.length; k < len; k++) {
      field = sortableFields[k];
      if (map.hasOwnProperty(field)) {
        levelMap[field] = map[field];
      } else {
        console.warn("Sortable field " + field + " not found in map!");
      }
    }
    return levelMap;
  };


  /*
  	 *
  	 * @method
  	 * @param {String} prop
  	 * @param {Object} map
   */

  Config.prototype._createDisplayNameMapFromMap = function(prop, map) {
    var j, k, len, newPropValues, oldPropValues, value;
    newPropValues = {};
    oldPropValues = _.clone(this.get(prop));
    if (oldPropValues.length > 0) {
      for (j = k = 0, len = oldPropValues.length; k < len; j = ++k) {
        value = oldPropValues[j];
        if (map.hasOwnProperty(value)) {
          newPropValues[value] = map[value];
        }
      }
    }
    return newPropValues;
  };


  /*
  	 * @method
   */

  Config.prototype._createLevelMapFromFacetData = function(sortableFields, facetsData) {
    var facetData, field, k, l, len, len1, levelMap;
    levelMap = {};
    for (k = 0, len = sortableFields.length; k < len; k++) {
      field = sortableFields[k];
      for (l = 0, len1 = facetsData.length; l < len1; l++) {
        facetData = facetsData[l];
        if (facetData.name === field) {
          levelMap[field] = facetData.title;
        }
      }
    }
    return levelMap;
  };


  /*
  	 *
  	 * @method
  	 * @param {String} prop
  	 * @param {Object} facetsData
  	 * @return {Object}
   */

  Config.prototype._createDisplayNameMapFromFacetData = function(prop, facetsData) {
    var facetData, i, j, k, l, len, len1, newPropValues, oldPropValues, value;
    newPropValues = {};
    oldPropValues = _.clone(this.get(prop));
    if (oldPropValues.length > 0) {
      for (i = k = 0, len = facetsData.length; k < len; i = ++k) {
        facetData = facetsData[i];
        for (j = l = 0, len1 = oldPropValues.length; l < len1; j = ++l) {
          value = oldPropValues[j];
          if (facetData.name === value) {
            newPropValues[value] = facetData.title;
          }
        }
      }
    }
    return newPropValues;
  };

  return Config;

})(Backbone.Model);

module.exports = Config;



},{"backbone":undefined,"underscore":undefined}],15:[function(_dereq_,module,exports){
var BooleanFacet, FacetModel,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetModel = _dereq_('./main');


/*
 * @class
 * @namespace Models
 */

BooleanFacet = (function(superClass) {
  extend(BooleanFacet, superClass);

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
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');


/*
 * @class
 * @namespace Models
 */

FacetModel = (function(superClass) {
  extend(FacetModel, superClass);

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



},{"backbone":undefined}],17:[function(_dereq_,module,exports){
var Backbone, QueryOptions, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

QueryOptions = (function(superClass) {
  extend(QueryOptions, superClass);

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



},{"backbone":undefined,"underscore":undefined}],18:[function(_dereq_,module,exports){
var Backbone, SearchModel, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

SearchModel = (function(superClass) {
  extend(SearchModel, superClass);

  function SearchModel() {
    return SearchModel.__super__.constructor.apply(this, arguments);
  }

  return SearchModel;

})(Backbone.Model);

module.exports = SearchModel;



},{"backbone":undefined,"underscore":undefined}],19:[function(_dereq_,module,exports){
var Backbone, SearchResult, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * @class
 * @namespace Models
 */

SearchResult = (function(superClass) {
  extend(SearchResult, superClass);

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



},{"backbone":undefined,"underscore":undefined}],20:[function(_dereq_,module,exports){
var $, Backbone, Facets, _, assert,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

$ = _dereq_('jquery');

assert = _dereq_('assert');


/*
 * @class
 * @namespace Views
 * @uses Config
 */

Facets = (function(superClass) {
  extend(Facets, superClass);

  function Facets() {
    this._renderFacet = bind(this._renderFacet, this);
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

  Facets.prototype.initialize = function(options1) {
    this.options = options1;
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
    var facet, facetData, facetName, facets, fragment, i, index, j, len, len1, placeholder, ref;
    this._destroyFacets();
    if (this.options.config.get('templates').hasOwnProperty('facets')) {
      for (index = i = 0, len = data.length; i < len; index = ++i) {
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
      ref = this.options.config.get('facetOrder');
      for (j = 0, len1 = ref.length; j < len1; j++) {
        facetName = ref[j];
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
    }
    this._postRenderFacets();
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
    var facetName, ref, results, view;
    ref = this.views;
    results = [];
    for (facetName in ref) {
      view = ref[facetName];
      if (this.options.config.get('collapse')) {
        view.collapse();
      }
      results.push(view.postRender());
    }
    return results;
  };


  /*
  	 * @method
  	 * @param {Object} facetData
   */

  Facets.prototype.update = function(facetData) {
    var data, options, ref, results, view, viewName;
    ref = this.views;
    results = [];
    for (viewName in ref) {
      if (!hasProp.call(ref, viewName)) continue;
      view = ref[viewName];
      data = _.findWhere(facetData, {
        name: viewName
      });
      options = data != null ? data.options : [];
      results.push(view.update(options));
    }
    return results;
  };


  /*
  	 * @method
   */

  Facets.prototype.reset = function() {
    var facetView, key, ref, results;
    ref = this.views;
    results = [];
    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      facetView = ref[key];
      if (typeof facetView.reset === 'function') {
        results.push(facetView.reset());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };


  /*
  	 * @method
  	 * @private
   */

  Facets.prototype._destroyFacets = function() {
    var ref, results, view, viewName;
    this.stopListening();
    ref = this.views;
    results = [];
    for (viewName in ref) {
      if (!hasProp.call(ref, viewName)) continue;
      view = ref[viewName];
      view.destroy();
      results.push(delete this.views[viewName]);
    }
    return results;
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
    var icon, open, span, text;
    ev.preventDefault();
    icon = $(ev.currentTarget).find('i.fa');
    span = $(ev.currentTarget).find('button span');
    open = icon.hasClass('fa-expand');
    icon.toggleClass('fa-compress');
    icon.toggleClass('fa-expand');
    text = open ? 'Collapse' : 'Expand';
    span.text(text + " filters");
    return this.slideFacets(open);
  };


  /*
  	 * Slide the facets down/open or up/close.
  	 *
  	 * @param {Bool} down Slide down (expand, open) or slide up (collapse, close).
   */

  Facets.prototype.slideFacets = function(down) {
    var facetNames, index, slideFacet;
    if (down == null) {
      down = true;
    }
    facetNames = _.keys(this.views);
    index = 0;
    slideFacet = (function(_this) {
      return function() {
        var facet, facetName;
        facetName = facetNames[index++];
        facet = _this.views[facetName];
        if (facet != null) {
          if (down) {
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



},{"./facets/boolean":21,"./facets/list":23,"./facets/range":32,"assert":2,"backbone":undefined,"jquery":undefined,"underscore":undefined}],21:[function(_dereq_,module,exports){
var $, BooleanFacet, Models, Views, _, bodyTpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

BooleanFacet = (function(superClass) {
  extend(BooleanFacet, superClass);

  function BooleanFacet() {
    return BooleanFacet.__super__.constructor.apply(this, arguments);
  }


  /*
  	 * @property
  	 * @type {String}
   */

  BooleanFacet.prototype.className = 'facet boolean';

  BooleanFacet.prototype.initialize = function(options) {
    var facetData;
    this.options = options;
    BooleanFacet.__super__.initialize.apply(this, arguments);
    facetData = this.parseFacetData(this.options.attrs);
    this.model = new Models.Boolean(facetData, {
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
    var $target, i, len, option, ref, value;
    $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
    $target.toggleClass('fa-square-o');
    $target.toggleClass('fa-check-square-o');
    value = $target.attr('data-value');
    ref = this.model.get('options');
    for (i = 0, len = ref.length; i < len; i++) {
      option = ref[i];
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
    var facetData;
    facetData = this.parseFacetData({
      name: this.options.attrs.name,
      options: newOptions
    });
    return this.model.set('options', facetData.options);
  };

  BooleanFacet.prototype.reset = function() {
    return this.render();
  };

  return BooleanFacet;

})(Views.Facet);

module.exports = BooleanFacet;



},{"../../../jade/facets/boolean.body.jade":44,"../../models/facets/boolean":15,"./main":30,"jquery":undefined,"underscore":undefined}],22:[function(_dereq_,module,exports){
var Backbone, ListOption, ListOptions, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

ListOption = _dereq_('../models/option.coffee');


/*
 * @class
 * @namespace Collections
 * @uses ListOption
 */

ListOptions = (function(superClass) {
  extend(ListOptions, superClass);

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
    return this.comparator = this.strategies.count_desc;
  };


  /*
  	 * Alias for reset, because a Backbone.Collection already has a reset method.
  	 *
  	 * @method
   */

  ListOptions.prototype.revert = function() {
    this.comparator = this.strategies.count_desc;
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
      return +(!model.get('visible')) + (+(!model.get('count')) + model.get('name').toLowerCase());
    },
    alpha_desc: function(model) {
      var str;
      str = String.fromCharCode.apply(String, _.map(model.get('name').toLowerCase().split(''), function(c) {
        return 0xffff - c.charCodeAt();
      }));
      return +(!model.get('visible')) + (+(!model.get('count')) + str);
    },
    count_asc: function(model) {
      var cnt, tmp;
      tmp = model.get('visible') ? 0 : 10;
      tmp += +(!model.get('count'));
      cnt = model.get('count') === 0 ? model.get('total') : model.get('count');
      return tmp -= 1 / cnt;
    },
    count_desc: function(model) {
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



},{"../models/option.coffee":25,"backbone":undefined,"underscore":undefined}],23:[function(_dereq_,module,exports){
var $, FacetView, List, ListFacet, ListFacetOptions, ListOptions, _, menuTpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

ListFacet = (function(superClass) {
  extend(ListFacet, superClass);

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
    facetData = this.parseFacetData(this.options.attrs);
    this.collection = new ListOptions(facetData.options, {
      parse: true
    });
    return this.render();
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
    var filteredModels, ref, value, visibleModels;
    visibleModels = this.collection.filter(function(model) {
      return model.get('visible');
    });
    value = (0 < (ref = visibleModels.length) && ref < 51) ? 'visible' : 'hidden';
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
      'click header .menu svg.filter': '_toggleFilterMenu',
      'click header .menu svg.alpha': '_changeOrder',
      'click header .menu svg.count': '_changeOrder'
    });
  };


  /*
  	 * @method
  	 * @private
   */

  ListFacet.prototype._toggleFilterMenu = function(ev) {
    var filterIcon, optionsDiv;
    optionsDiv = this.$('header .options');
    filterIcon = ev.currentTarget;
    $(filterIcon).toggleClass('active');
    return optionsDiv.slideToggle(150, (function(_this) {
      return function() {
        var input;
        input = optionsDiv.find('input[name="filter"]');
        if ($(filterIcon).hasClass('active')) {
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
    var el, i, j, k, l, len, len1, len2, len3, order, ref, ref1, ref2, ref3, type;
    if (!this.$("svg.filter").hasClass("active")) {
      this.optionsView.renderAll();
    }
    type = ev.currentTarget.getAttribute("class").indexOf("alphabetically") > -1 ? "alpha" : "count";
    if ($(ev.currentTarget).hasClass("active")) {
      order = ev.currentTarget.getAttribute("class").indexOf("descending") > -1 ? "asc" : "desc";
      if ($(ev.currentTarget).hasClass("alpha")) {
        ref = this.el.querySelectorAll("svg.alpha");
        for (i = 0, len = ref.length; i < len; i++) {
          el = ref[i];
          $(el).toggleClass("visible");
          if (el !== ev.currentTarget) {
            $(el).addClass("active");
          } else {
            $(el).removeClass("active");
          }
        }
      } else if ($(ev.currentTarget).hasClass("count")) {
        ref1 = this.el.querySelectorAll("svg.count");
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          el = ref1[j];
          $(el).toggleClass("visible");
          if (el !== ev.currentTarget) {
            $(el).addClass("active");
          } else {
            $(el).removeClass("active");
          }
        }
      }
    } else {
      order = ev.currentTarget.getAttribute("class").indexOf("descending") > -1 ? "desc" : "asc";
      ref2 = this.el.querySelectorAll("svg.count.active");
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        el = ref2[k];
        $(el).removeClass("active");
      }
      ref3 = this.el.querySelectorAll("svg.alpha.active");
      for (l = 0, len3 = ref3.length; l < len3; l++) {
        el = ref3[l];
        $(el).removeClass("active");
      }
      $(ev.currentTarget).addClass("active");
    }
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
      facetData = this.parseFacetData({
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
    if ((this.el.querySelector('svg.filter') != null) && $('svg.filter').hasClass('active')) {
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
    if ((this.el.querySelector('svg.filter') != null) && $('svg.filter').hasClass('active')) {
      this._toggleFilterMenu();
    }
    this.collection.revert();
    return this.collection.sort();
  };

  return ListFacet;

})(FacetView);

module.exports = ListFacet;



},{"../main":30,"./collections/options":22,"./models/list":24,"./options":26,"./templates/menu.jade":28,"jquery":undefined,"underscore":undefined}],24:[function(_dereq_,module,exports){
var FacetModel, List,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FacetModel = _dereq_('../../../../models/facets/main');


/*
 * @class
 * @namespace Models
 */

List = (function(superClass) {
  extend(List, superClass);

  function List() {
    return List.__super__.constructor.apply(this, arguments);
  }

  return List;

})(FacetModel);

module.exports = List;



},{"../../../../models/facets/main":16}],25:[function(_dereq_,module,exports){
var Backbone, ListOption,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');


/*
 * @class
 * @namespace Models
 */

ListOption = (function(superClass) {
  extend(ListOption, superClass);

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



},{"backbone":undefined}],26:[function(_dereq_,module,exports){
var $, Backbone, ListFacetOptions, _, bodyTpl, funcky, optionTpl,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

ListFacetOptions = (function(superClass) {
  extend(ListFacetOptions, superClass);

  function ListFacetOptions() {
    this.triggerChange = bind(this.triggerChange, this);
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
        _this.collection.orderBy('count_desc', true);
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
    tpl = "";
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


  /*
  	 * @method
  	 * @param {Boolean} all
   */

  ListFacetOptions.prototype.appendOptions = function(all) {
    var model, tpl;
    if (all == null) {
      all = false;
    }
    if (this.$('ul > li').length === this.collection.length) {
      return;
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
  	 * When all models are set to visible, the collection is sorted and
  	 * this.rerender is called.
  	 *
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
    var j, len, model, values, visibleModels;
    visibleModels = this.collection.filter(function(model) {
      return model.get('visible');
    });
    for (j = 0, len = visibleModels.length; j < len; j++) {
      model = visibleModels[j];
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



},{"./templates/body.jade":27,"./templates/option.jade":29,"backbone":undefined,"funcky.util":10,"jquery":undefined,"underscore":undefined}],27:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<ul></ul>");;return buf.join("");
};
},{"jade/runtime":12}],28:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

buf.push("<input type=\"checkbox\" name=\"all\"/><input type=\"text\" name=\"filter\"/><small class=\"optioncount\"></small>");;return buf.join("");
};
},{"jade/runtime":12}],29:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (option) {
jade_mixins["checked-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 489 402\" class=\"checked\"><path d=\"M 377.87,24.128 C 361.786,8.044 342.417,0.002 319.769,0.002 H 82.227 C 59.579,0.002 40.211,8.044 24.125,24.128 8.044,40.214 0.002,59.578 0.002,82.23 v 237.543 c 0,22.647 8.042,42.014 24.123,58.101 16.086,16.085 35.454,24.127 58.102,24.127 h 237.542 c 22.648,0 42.011,-8.042 58.102,-24.127 16.085,-16.087 24.126,-35.453 24.126,-58.101 V 82.23 C 401.993,59.582 393.951,40.214 377.87,24.128 z m -12.422,295.645 c 0,12.559 -4.47,23.314 -13.415,32.264 -8.945,8.945 -19.698,13.411 -32.265,13.411 H 82.227 c -12.563,0 -23.317,-4.466 -32.264,-13.411 -8.945,-8.949 -13.418,-19.705 -13.418,-32.264 V 82.23 c 0,-12.562 4.473,-23.316 13.418,-32.264 C 58.91,41.02 69.664,36.548 82.227,36.548 h 237.542 c 12.566,0 23.319,4.473 32.265,13.418 8.945,8.947 13.415,19.701 13.415,32.264 v 237.543 l -0.001,0 z\"></path><path d=\"M 480.59183,75.709029 442.06274,38.831006 c -5.28301,-5.060423 -11.70817,-7.591583 -19.26056,-7.591583 -7.55937,0 -13.98453,2.53116 -19.26753,7.591583 L 217.6825,216.98773 134.38968,136.99258 c -5.28896,-5.06231 -11.71015,-7.59062 -19.26256,-7.59062 -7.55736,0 -13.97854,2.52831 -19.267516,7.59062 l -38.529082,36.87898 c -5.28897,5.06136 -7.932461,11.20929 -7.932461,18.44186 0,7.22686 2.643491,13.38049 7.932461,18.4409 l 102.555358,98.15873 38.53207,36.87803 c 5.28598,5.06421 11.70916,7.59253 19.26455,7.59253 7.5524,0 13.97558,-2.53496 19.26454,-7.59253 l 38.53107,-36.87803 205.11372,-196.32314 c 5.284,-5.06232 7.93246,-11.20929 7.93246,-18.441873 0.005,-7.228765 -2.64846,-13.376685 -7.93246,-18.439008 z\"></path></svg>");
};
jade_mixins["unchecked-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 401.998 401.998\" class=\"unchecked\"><path d=\"M377.87,24.126C361.786,8.042,342.417,0,319.769,0H82.227C59.579,0,40.211,8.042,24.125,24.126 C8.044,40.212,0.002,59.576,0.002,82.228v237.543c0,22.647,8.042,42.014,24.123,58.101c16.086,16.085,35.454,24.127,58.102,24.127 h237.542c22.648,0,42.011-8.042,58.102-24.127c16.085-16.087,24.126-35.453,24.126-58.101V82.228 C401.993,59.58,393.951,40.212,377.87,24.126z M365.448,319.771c0,12.559-4.47,23.314-13.415,32.264 c-8.945,8.945-19.698,13.411-32.265,13.411H82.227c-12.563,0-23.317-4.466-32.264-13.411c-8.945-8.949-13.418-19.705-13.418-32.264 V82.228c0-12.562,4.473-23.316,13.418-32.264c8.947-8.946,19.701-13.418,32.264-13.418h237.542 c12.566,0,23.319,4.473,32.265,13.418c8.945,8.947,13.415,19.701,13.415,32.264V319.771L365.448,319.771z\"></path></svg>");
};
































var displayName = option.id
var emptyValues = ["", ":empty", "(empty)"]
if ( emptyValues.indexOf(option.id) > -1)
{
displayName = '<em>(empty)</em>'
}
if ( option.get('displayName') != null)
{
displayName = option.get('displayName')
}
buf.push("<li" + (jade.attr("data-count", option.get('count'), true, false)) + (jade.attr("data-value", option.id, true, false)) + (jade.cls([option.get('checked')?'checked':null], [true])) + ">");
jade_mixins["unchecked-icon"]();
jade_mixins["checked-icon"]();
buf.push("<label" + (jade.attr("data-value", option.id, true, false)) + ">" + (null == (jade_interp = displayName) ? "" : jade_interp) + "</label><div class=\"count\">" + (jade.escape(null == (jade_interp = option.get('count') === 0 ? option.get('total') : option.get('count')) ? "" : jade_interp)) + "</div></li>");}.call(this,"option" in locals_for_with?locals_for_with.option:typeof option!=="undefined"?option:undefined));;return buf.join("");
};
},{"jade/runtime":12}],30:[function(_dereq_,module,exports){
var $, Backbone, FacetView, _, tpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

$ = _dereq_('jquery');

_ = _dereq_('underscore');

tpl = _dereq_('../../../jade/facets/main.jade');


/*
 * @class
 * @abstract
 * @namespace Views
 */

FacetView = (function(superClass) {
  extend(FacetView, superClass);

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
    if (this.config.get('facetDisplayNames').hasOwnProperty(options.attrs.name)) {
      return options.attrs.title = this.config.get('facetDisplayNames')[options.attrs.name];
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
  	 * @method
  	 * @private
  	 * @param {Object} facetData
  	 * @return {Object} Parsed facet data
   */

  FacetView.prototype.parseFacetData = function(facetData) {
    var parsers;
    parsers = this.options.config.get('parsers');
    if (parsers.hasOwnProperty(facetData.name)) {
      facetData = parsers[facetData.name](facetData);
    }
    return facetData;
  };


  /*
  	 * Every facet can be minimized by clicking the title of the facet.
  	 *
  	 * @method
  	 * @private
  	 * @param {Object} ev The event object.
   */

  FacetView.prototype._toggleBody = function(ev) {
    var func;
    func = this.$('.body').is(':visible') ? this.hideBody : this.showBody;
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
   */

  FacetView.prototype.collapse = function() {
    this._hideMenu();
    this.$('header i.fa').hide();
    return this.$('.body').hide();
  };


  /*
  	 * @method
  	 * @param {Function} done Callback called when hide body animation has finished.
   */

  FacetView.prototype.hideBody = function(done) {
    this._hideMenu();
    return this.$('.body').slideUp(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header > .menu').fadeOut(100);
      };
    })(this));
  };


  /*
  	 * @method
  	 * @param {Function} done Callback called when show body animation has finished.
   */

  FacetView.prototype.showBody = function(done) {
    return this.$('.body').slideDown(100, (function(_this) {
      return function() {
        if (done != null) {
          done();
        }
        return _this.$('header > .menu').fadeIn(100);
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



},{"../../../jade/facets/main.jade":45,"backbone":undefined,"jquery":undefined,"underscore":undefined}],31:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (max, min) {
buf.push("<div class=\"slider\"><span class=\"dash\">-</span><div class=\"handle-min handle\"><input" + (jade.attr("value", min, true, false)) + " class=\"min\"/><label class=\"min\">" + (jade.escape(null == (jade_interp = min) ? "" : jade_interp)) + "</label></div><div class=\"handle-max handle\"><input" + (jade.attr("value", max, true, false)) + " class=\"max\"/><label class=\"max\">" + (jade.escape(null == (jade_interp = max) ? "" : jade_interp)) + "</label></div><div class=\"bar\">&nbsp;</div><button title=\"Search within given range\"><svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 216 146\" xml:space=\"preserve\"><path d=\"M172.77,123.025L144.825,95.08c6.735-9.722,10.104-20.559,10.104-32.508c0-7.767-1.508-15.195-4.523-22.283c-3.014-7.089-7.088-13.199-12.221-18.332s-11.242-9.207-18.33-12.221c-7.09-3.015-14.518-4.522-22.285-4.522c-7.767,0-15.195,1.507-22.283,4.522c-7.089,3.014-13.199,7.088-18.332,12.221c-5.133,5.133-9.207,11.244-12.221,18.332c-3.015,7.089-4.522,14.516-4.522,22.283c0,7.767,1.507,15.193,4.522,22.283c3.014,7.088,7.088,13.197,12.221,18.33c5.133,5.134,11.244,9.207,18.332,12.222c7.089,3.015,14.516,4.522,22.283,4.522c11.951,0,22.787-3.369,32.509-10.104l27.945,27.863c1.955,2.064,4.397,3.096,7.332,3.096c2.824,0,5.27-1.032,7.332-3.096c2.064-2.063,3.096-4.508,3.096-7.332C175.785,127.479,174.781,125.034,172.77,123.025z M123.357,88.357c-7.143,7.143-15.738,10.714-25.787,10.714c-10.048,0-18.643-3.572-25.786-10.714c-7.143-7.143-10.714-15.737-10.714-25.786c0-10.048,3.572-18.644,10.714-25.786c7.142-7.143,15.738-10.714,25.786-10.714c10.048,0,18.643,3.572,25.787,10.714c7.143,7.142,10.715,15.738,10.715,25.786C134.072,72.62,130.499,81.214,123.357,88.357z\"></path></svg></button></div>");}.call(this,"max" in locals_for_with?locals_for_with.max:typeof max!=="undefined"?max:undefined,"min" in locals_for_with?locals_for_with.min:typeof min!=="undefined"?min:undefined));;return buf.join("");
};
},{"jade/runtime":12}],32:[function(_dereq_,module,exports){
var $, FacetView, MonthRange, Range, RangeFacet, _, bodyTpl, monthRangeTpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

$ = _dereq_('jquery');

_ = _dereq_('underscore');

Range = _dereq_('./model');

MonthRange = _dereq_('./month-model');

FacetView = _dereq_('../main');

bodyTpl = _dereq_('./body.jade');

monthRangeTpl = _dereq_('./month-body.jade');


/*
 * @class
 * @namespace Views
 * @uses Range
 */

RangeFacet = (function(superClass) {
  extend(RangeFacet, superClass);

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

  RangeFacet.prototype.initialize = function(options1) {
    this.options = options1;
    RangeFacet.__super__.initialize.apply(this, arguments);
    if (this.options.config.get('rangeMonthMode')) {
      this.model = new MonthRange(this.options.attrs, {
        parse: true
      });
    } else {
      this.model = new Range(this.options.attrs, {
        parse: true
      });
    }
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
        _this.labelMin.html(Math.ceil(value));
        if (_this.options.config.get('rangeMonthMode')) {
          return _this.labelMonthMin.html(_this.model.getMonthLabel(value, true));
        }
      };
    })(this));
    this.listenTo(this.model, 'change:currentMax', (function(_this) {
      return function(model, value) {
        _this.labelMax.html(Math.ceil(value));
        if (_this.options.config.get('rangeMonthMode')) {
          return _this.labelMonthMax.html(_this.model.getMonthLabel(value, true));
        }
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
    if (this.options.config.get('rangeMonthMode')) {
      rtpl = monthRangeTpl(this.model.attributes);
    } else {
      rtpl = bodyTpl(this.model.attributes);
    }
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
    if (this.options.config.get('rangeMonthMode')) {
      this.labelMonthMin = this.$('label.month-min');
      this.labelMonthMax = this.$('label.month-max');
      this.labelMonthMin.html(this.model.getMonthLabel(this.model.get('currentMin')));
      this.labelMonthMax.html(this.model.getMonthLabel(this.model.get('currentMax')));
    }
    this.bar = this.$('.bar');
    this.button = this.el.querySelector('button');
    if (this.options.config.get("rangeFacetAlwaysShowButton")) {
      this.button.style.display = 'block';
    }
    slider = this.$('.slider');
    if (slider.width() !== 0) {
      return this.model.set({
        sliderWidth: slider.width(),
        sliderLeft: slider.offset().left,
        handleMinLeft: this.handleMin.position().left,
        handleMaxLeft: this.handleMax.position().left,
        handleWidth: this.handleMin.width()
      });
    }
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
      },
      'dblclick label.month-min': function(ev) {
        return this.enableInputEditable(this.labelMonthMin);
      },
      'dblclick label.month-max': function(ev) {
        return this.enableInputEditable(this.labelMonthMax);
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
      if (ev.currentTarget.className.indexOf('month-min') > -1) {
        this.model.setFromLabel({
          currentMin: ev.currentTarget.value
        });
        return this.disableInputEditable(this.labelMonthMin);
      } else if (ev.currentTarget.className.indexOf('month-max') > -1) {
        this.model.setFromLabel({
          currentMax: ev.currentTarget.value
        });
        return this.disableInputEditable(this.labelMonthMax);
      } else if (ev.currentTarget.className.indexOf('min') > -1) {
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
    input.addClass(label.attr("class"));
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
    var name, queryOptions;
    if (options == null) {
      options = {};
    }
    name = this.model.get('name');
    if ((this.options.config.get('customQueryNames') != null) && this.options.config.get('customQueryNames')[name]) {
      name = this.options.config.get('customQueryNames')[name];
    }
    queryOptions = {
      facetValue: {
        name: name,
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
    if ((this.button != null) && !this.options.config.get("rangeFacetAlwaysShowButton")) {
      return this.button.style.display = 'none';
    }
  };


  /*
  	 * @method
  	 * @override FacetView::showBody
   */

  RangeFacet.prototype.showBody = function(done) {
    var ready;
    ready = (function(_this) {
      return function() {
        if (!_this.model.has('sliderWidth') || (_this.model.get('sliderWidth') === 0)) {
          _this.postRender();
        }
        if (done != null) {
          return done();
        }
      };
    })(this);
    return RangeFacet.__super__.showBody.call(this, ready);
  };

  return RangeFacet;

})(FacetView);

module.exports = RangeFacet;



},{"../main":30,"./body.jade":31,"./model":33,"./month-body.jade":34,"./month-model":35,"jquery":undefined,"underscore":undefined}],33:[function(_dereq_,module,exports){
var FacetModel, Range, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = _dereq_('underscore');

FacetModel = _dereq_('../../../models/facets/main');


/*
 * @class
 * @namespace Models
 */

Range = (function(superClass) {
  extend(Range, superClass);

  function Range() {
    this.dragMax = bind(this.dragMax, this);
    this.dragMin = bind(this.dragMin, this);
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
      sliderWidth: null,
      lowerLimit: null,
      upperLimit: null
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
    attrs.lowerLimit = attrs.options[0].lowerLimit;
    attrs.upperLimit = attrs.options[0].upperLimit;
    attrs.min = attrs.currentMin = this.convertLimit2Year(attrs.lowerLimit);
    attrs.max = attrs.currentMax = this.convertLimit2Year(attrs.upperLimit);
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
    if (year.length === 0) {
      year = "0";
    }
    if (year.length > 4) {
      if (year.length === 8) {
        year = year.substr(0, 4);
      } else if (year.length === 7) {
        year = year.substr(0, 3);
      } else {
        throw new Error("Range: lower or upper limit is not 0, 1, 2, 3, 4, 7 or 8 chars!");
      }
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
    var limit;
    limit = this.get('currentMin');
    if ((this.get('lowerLimit') + "").length > 4) {
      limit = this._convertYear2Limit(this.get('currentMin'));
    }
    return limit;
  };

  Range.prototype.getUpperLimit = function() {
    var limit;
    limit = this.get('currentMax');
    if ((this.get('lowerLimit') + "").length > 4) {
      limit = this._convertYear2Limit(this.get('currentMax'), false);
    }
    return limit;
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



},{"../../../models/facets/main":16,"underscore":undefined}],34:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (max, min, monthMax, monthMin) {
buf.push("<div class=\"slider\"><span class=\"dash\">-</span><div class=\"handle-min handle\"><input" + (jade.attr("value", min, true, false)) + " class=\"min\"/><label class=\"min hidden\">" + (jade.escape(null == (jade_interp = min) ? "" : jade_interp)) + "</label><label class=\"month-min\">" + (jade.escape(null == (jade_interp = monthMin) ? "" : jade_interp)) + "</label></div><div class=\"handle-max handle\"><input" + (jade.attr("value", max, true, false)) + " class=\"max\"/><label class=\"max hidden\">" + (jade.escape(null == (jade_interp = max) ? "" : jade_interp)) + "</label><label class=\"month-max\">" + (jade.escape(null == (jade_interp = monthMax) ? "" : jade_interp)) + "</label></div><div class=\"bar\">&nbsp;</div><button title=\"Search within given range\"><svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 216 146\" xml:space=\"preserve\"><path d=\"M172.77,123.025L144.825,95.08c6.735-9.722,10.104-20.559,10.104-32.508c0-7.767-1.508-15.195-4.523-22.283c-3.014-7.089-7.088-13.199-12.221-18.332s-11.242-9.207-18.33-12.221c-7.09-3.015-14.518-4.522-22.285-4.522c-7.767,0-15.195,1.507-22.283,4.522c-7.089,3.014-13.199,7.088-18.332,12.221c-5.133,5.133-9.207,11.244-12.221,18.332c-3.015,7.089-4.522,14.516-4.522,22.283c0,7.767,1.507,15.193,4.522,22.283c3.014,7.088,7.088,13.197,12.221,18.33c5.133,5.134,11.244,9.207,18.332,12.222c7.089,3.015,14.516,4.522,22.283,4.522c11.951,0,22.787-3.369,32.509-10.104l27.945,27.863c1.955,2.064,4.397,3.096,7.332,3.096c2.824,0,5.27-1.032,7.332-3.096c2.064-2.063,3.096-4.508,3.096-7.332C175.785,127.479,174.781,125.034,172.77,123.025z M123.357,88.357c-7.143,7.143-15.738,10.714-25.787,10.714c-10.048,0-18.643-3.572-25.786-10.714c-7.143-7.143-10.714-15.737-10.714-25.786c0-10.048,3.572-18.644,10.714-25.786c7.142-7.143,15.738-10.714,25.786-10.714c10.048,0,18.643,3.572,25.787,10.714c7.143,7.142,10.715,15.738,10.715,25.786C134.072,72.62,130.499,81.214,123.357,88.357z\"></path></svg></button></div>");}.call(this,"max" in locals_for_with?locals_for_with.max:typeof max!=="undefined"?max:undefined,"min" in locals_for_with?locals_for_with.min:typeof min!=="undefined"?min:undefined,"monthMax" in locals_for_with?locals_for_with.monthMax:typeof monthMax!=="undefined"?monthMax:undefined,"monthMin" in locals_for_with?locals_for_with.monthMin:typeof monthMin!=="undefined"?monthMin:undefined));;return buf.join("");
};
},{"jade/runtime":12}],35:[function(_dereq_,module,exports){
var MonthRange, Range,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Range = _dereq_('./model');

MonthRange = (function(superClass) {
  extend(MonthRange, superClass);

  function MonthRange() {
    return MonthRange.__super__.constructor.apply(this, arguments);
  }

  MonthRange.prototype.convertLimit2Year = function(limit) {
    var year;
    year = limit + '';
    if (year.length === 0) {
      year = "0";
    }
    if (year.length > 6) {
      if (year.length === 8) {
        year = year.substr(0, 6);
      } else if (year.length === 7) {
        year = year.substr(0, 5);
      } else {
        throw new Error("Range: lower or upper limit is not 0, 1, 2, 3, 4, 7 or 8 chars!");
      }
    }
    return +year;
  };

  MonthRange.prototype._convertYear2Limit = function(year, from) {
    var limit;
    if (from == null) {
      from = true;
    }
    limit = year + '';
    limit += from ? "01" : "31";
    return +limit;
  };

  MonthRange.prototype.getLowerLimit = function() {
    var monthPart, unit;
    unit = this.get('currentMin');
    monthPart = "" + (parseInt((parseInt(("" + unit).substr(4, 2)) / 100) * 12) + 1);
    if (monthPart.length === 1) {
      monthPart = "0" + monthPart;
    }
    return parseInt(("" + unit).substr(0, 4) + monthPart + "01");
  };

  MonthRange.prototype.getUpperLimit = function() {
    var monthPart, unit;
    unit = this.get('currentMax');
    monthPart = "" + (parseInt((parseInt(("" + unit).substr(4, 2)) / 100) * 12) + 1);
    if (monthPart.length === 1) {
      monthPart = "0" + monthPart;
    }
    return parseInt(("" + unit).substr(0, 4) + monthPart + "31");
  };

  MonthRange.prototype.setFromLabel = function(data) {
    var dd, key, mConv, valid;
    key = 'currentMin';
    if (data.hasOwnProperty('currentMax')) {
      key = 'currentMax';
    }
    valid = data[key].match(/^[0-9]{4}-[0-9]{2}$/);
    if (valid != null) {
      dd = data[key].split("-");
      mConv = Math.ceil((+dd[1] - 1) / 12 * 100);
      if (key === 'currentMin') {
        return this.set({
          currentMin: +dd[0] * 100 + mConv
        });
      } else {
        return this.set({
          currentMax: +dd[0] * 100 + mConv
        });
      }
    } else {
      if (key === 'currentMin') {
        return this.set({
          currentMin: this.get('min')
        });
      } else {
        return this.set({
          currentMax: this.get('max')
        });
      }
    }
  };

  MonthRange.prototype.getMonthLabel = function(unit, conv) {
    var monthPart;
    if (conv) {
      monthPart = "" + (parseInt((parseInt(("" + unit).substr(4, 2)) / 100) * 12) + 1);
    } else {
      monthPart = ("" + unit).substr(4, 2);
    }
    if (monthPart.length === 1) {
      monthPart = "0" + monthPart;
    }
    return ("" + unit).substr(0, 4) + "-" + monthPart;
  };

  return MonthRange;

})(Range);

module.exports = MonthRange;



},{"./model":33}],36:[function(_dereq_,module,exports){
var $, Backbone, HibbPagination, Result, Results, SortLevels, _, listItems, tpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

Results = (function(superClass) {
  extend(Results, superClass);

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
        _this.$('header h3.numfound').html((_this.options.config.get('labels').numFound) + " " + (responseModel.get('numFound')) + " " + (_this.options.config.get('termPlural')));
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
    this.subviews.sortLevels = new SortLevels({
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
    var frag, fulltext, i, len, pageNumber, ref, result, ul;
    this._destroyResultItems();
    this.$("div.pages").html('');
    fulltext = false;
    if (responseModel.get('results').length > 0 && (responseModel.get('results')[0].terms != null)) {
      if (Object.keys(responseModel.get('results')[0].terms).length > 0) {
        fulltext = true;
      }
    }
    frag = document.createDocumentFragment();
    ref = responseModel.get('results');
    for (i = 0, len = ref.length; i < len; i++) {
      result = ref[i];
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
    this.$("div.pages").append(ul);
    return this.trigger("render:finished");
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
      resultsTotal: responseModel.get('numFound'),
      showPageNames: this.options.config.get('showPageNames')
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
    var i, item, len, ref, results;
    ref = this.resultItems;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(item.destroy());
    }
    return results;
  };

  return Results;

})(Backbone.View);

module.exports = Results;



},{"./index.jade":37,"./result":38,"./sort":40,"backbone":undefined,"hibb-pagination":11,"jquery":undefined,"underscore":undefined}],37:[function(_dereq_,module,exports){
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
},{"jade/runtime":12}],38:[function(_dereq_,module,exports){
var Backbone, Result, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');


/*
 * The view of one result item < li >.
 *
 * @class Result
 * @namespace Views
 * @todo Rename to ResultItem
 */

Result = (function(superClass) {
  extend(Result, superClass);

  function Result() {
    return Result.__super__.constructor.apply(this, arguments);
  }

  Result.prototype.template = _dereq_('./result.jade');


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
    var base;
    this.options = options;
    if ((base = this.options).fulltext == null) {
      base.fulltext = false;
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
    var count, found, ref, term, tplData;
    found = [];
    ref = this.options.data.terms;
    for (term in ref) {
      if (!hasProp.call(ref, term)) continue;
      count = ref[term];
      found.push(count + "x " + term);
    }
    if (this.options.config.get('templates').hasOwnProperty('result')) {
      this.template = this.options.config.get('templates').result;
    }
    tplData = {
      data: this.options.data,
      fulltext: this.options.fulltext,
      found: found.join(', ')
    };
    if (this.options.config.get('templateData').hasOwnProperty('result')) {
      tplData = _.extend(tplData, this.options.config.get('templateData').result);
    }
    this.$el.html(this.template(tplData));
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



},{"./result.jade":39,"backbone":undefined,"underscore":undefined}],39:[function(_dereq_,module,exports){
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
},{"jade/runtime":12}],40:[function(_dereq_,module,exports){
var $, Backbone, SortLevels, el, tpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

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

SortLevels = (function(superClass) {
  extend(SortLevels, superClass);

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
    return this.listenTo(this.options.config, 'change:initLevels', this.render);
  };


  /*
  	 * @method
  	 * @chainable
  	 * @return {SortLevels}
   */

  SortLevels.prototype.render = function() {
    var leave, levels, rtpl;
    if (Object.keys(this.options.config.get('initLevels')).length > 0) {
      rtpl = tpl({
        initLevels: this.options.config.get('initLevels'),
        levels: this.options.config.get('levels')
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
    }
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
    var $target, i, j, k, len, len1, ref, ref1, results, select, target;
    this.$('div.levels').addClass('show-save-button');
    target = ev.currentTarget;
    ref = this.el.querySelectorAll('div.levels select');
    for (j = 0, len = ref.length; j < len; j++) {
      select = ref[j];
      if (select.name !== target.name && select.value === target.value) {
        select.selectedIndex = 0;
      }
    }
    ref1 = this.el.querySelectorAll('div.levels i.fa');
    results = [];
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      i = ref1[k];
      $target = this.$(i);
      $target.addClass('fa-sort-alpha-asc');
      results.push($target.removeClass('fa-sort-alpha-desc'));
    }
    return results;
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
    var fieldName, j, len, li, ref, select, sortParameter, sortParameters;
    sortParameters = [];
    ref = this.el.querySelectorAll('div.levels li[name]');
    for (j = 0, len = ref.length; j < len; j++) {
      li = ref[j];
      select = li.querySelector('select');
      fieldName = select.options[select.selectedIndex].value;
      if (fieldName !== "") {
        sortParameter = {};
        sortParameter.fieldname = fieldName;
        sortParameter.direction = $(li).find('i.fa').hasClass('fa-sort-alpha-asc') ? 'asc' : 'desc';
        sortParameters.push(sortParameter);
      }
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



},{"./sort.jade":41,"backbone":undefined,"funcky.el":8,"jquery":undefined}],41:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (Object, initLevels, levels, undefined) {
buf.push("<button class=\"toggle\">Sort<i class=\"fa fa-caret-down\"></i></button><div class=\"levels\"><ul>");
// iterate [1, 2, 3]
;(function(){
  var $$obj = [1, 2, 3];
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var i = $$obj[$index];

buf.push("<li" + (jade.attr("name", 'level'+i, true, false)) + "><label>" + (jade.escape(null == (jade_interp = 'Level '+i) ? "" : jade_interp)) + "</label><select" + (jade.attr("name", 'level'+i, true, false)) + "><option></option>");
// iterate Object.keys(levels)
;(function(){
  var $$obj = Object.keys(levels);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var field = $$obj[$index];

var selected = field == Object.keys(initLevels)[i - 1]
buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = levels[field]) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var field = $$obj[$index];

var selected = field == Object.keys(initLevels)[i - 1]
buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = levels[field]) ? "" : jade_interp)) + "</option>");
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
// iterate Object.keys(levels)
;(function(){
  var $$obj = Object.keys(levels);
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var field = $$obj[$index];

var selected = field == Object.keys(initLevels)[i - 1]
buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = levels[field]) ? "" : jade_interp)) + "</option>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var field = $$obj[$index];

var selected = field == Object.keys(initLevels)[i - 1]
buf.push("<option" + (jade.attr("value", field, true, false)) + (jade.attr("selected", selected, true, false)) + ">" + (jade.escape(null == (jade_interp = levels[field]) ? "" : jade_interp)) + "</option>");
    }

  }
}).call(this);

buf.push("</select><i class=\"fa fa-sort-alpha-asc\"></i></li>");
    }

  }
}).call(this);

buf.push("<li class=\"search\">&nbsp;<button>Change levels</button></li></ul></div>");}.call(this,"Object" in locals_for_with?locals_for_with.Object:typeof Object!=="undefined"?Object:undefined,"initLevels" in locals_for_with?locals_for_with.initLevels:typeof initLevels!=="undefined"?initLevels:undefined,"levels" in locals_for_with?locals_for_with.levels:typeof levels!=="undefined"?levels:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":12}],42:[function(_dereq_,module,exports){
var Backbone, SearchModel, TextSearch, _, funcky, tpl,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Backbone = _dereq_('backbone');

_ = _dereq_('underscore');

SearchModel = _dereq_('../../models/search');

tpl = _dereq_('./index.jade');

funcky = _dereq_('funcky.util');


/*
 * @class
 * @namespace Views
 * @uses Config
 * @uses SearchModel
 */

TextSearch = (function(superClass) {
  extend(TextSearch, superClass);

  function TextSearch() {
    return TextSearch.__super__.constructor.apply(this, arguments);
  }

  TextSearch.prototype.className = 'text-search';


  /*
  	 * The current field to search in.
  	 *
  	 * @property
  	 * @type {String}
   */

  TextSearch.prototype.currentField = "";


  /*
  	 * @method
  	 * @construct
  	 * @param {Object} this.options
  	 * @param {Config} this.options.config
   */

  TextSearch.prototype.initialize = function(options1) {
    this.options = options1;
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
      generateId: funcky.generateID,
      currentField: this.currentField
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
    var ftsp, i, len, param, params;
    ftsp = this.options.config.get('textSearchOptions').fullTextSearchParameters;
    if (ftsp != null) {
      this.currentField = ftsp[0];
      params = [];
      for (i = 0, len = ftsp.length; i < len; i++) {
        param = ftsp[i];
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
    return this.listenTo(this.options.config, "change:textSearchOptions", (function(_this) {
      return function(config, textSearchOptions, options) {
        var fullTextSearchParameters, i, len, param, params;
        _this.model.set(textSearchOptions);
        fullTextSearchParameters = _this.options.config.get('textSearchOptions').fullTextSearchParameters;
        if (fullTextSearchParameters != null) {
          _this.currentField = fullTextSearchParameters[0];
          params = [];
          for (i = 0, len = fullTextSearchParameters.length; i < len; i++) {
            param = fullTextSearchParameters[i];
            params.push({
              name: param,
              term: "*"
            });
          }
          _this.model.set({
            fullTextSearchParameters: params
          });
        }
        return _this.render();
      };
    })(this));
  };


  /*
  	 * @method
  	 * @private
   */

  TextSearch.prototype._updateFullTextSearchParameters = function() {
    var parameter;
    parameter = {
      name: this.currentField,
      term: this.el.querySelector('input[name="search"]').value
    };
    return this.model.set({
      fullTextSearchParameters: [parameter]
    });
  };


  /*
  	 * @method
  	 * @private
   */

  TextSearch.prototype.onKeyUp = function(ev) {
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
      this._updateFullTextSearchParameters();
    }
    return this.updateQueryModel();
  };


  /*
  	 * @method
  	 * @param {Object} ev The event object.
   */

  TextSearch.prototype.checkboxChanged = function(ev) {
    var attr, cb, checkedArray, dataAttr, dataAttrArray, i, j, len, len1, ref, ref1;
    dataAttr = ev.currentTarget.getAttribute('data-attr');
    dataAttrArray = ev.currentTarget.getAttribute('data-attr-array');
    if (attr = dataAttr) {
      if (attr === 'searchInTranscriptions') {
        this.$('ul.textlayers').toggle(ev.currentTarget.checked);
      }
      this.model.set(attr, ev.currentTarget.checked);
    } else if (dataAttrArray === 'fullTextSearchParameters') {
      ref = this.el.querySelectorAll('[data-attr-array="fullTextSearchParameters"]');
      for (i = 0, len = ref.length; i < len; i++) {
        cb = ref[i];
        if (cb.checked) {
          this.currentField = cb.getAttribute('data-value');
        }
      }
      this._updateFullTextSearchParameters();
    } else if (dataAttrArray != null) {
      checkedArray = [];
      ref1 = this.el.querySelectorAll("[data-attr-array=\"" + dataAttrArray + "\"]");
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        cb = ref1[j];
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



},{"../../models/search":18,"./index.jade":43,"backbone":undefined,"funcky.util":10,"underscore":undefined}],43:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config, currentField, generateId, id, model, textSearchId, undefined) {








jade_mixins["search-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 250.313 250.313\" class=\"search\"><path d=\"M244.186,214.604l-54.379-54.378c-0.289-0.289-0.628-0.491-0.93-0.76 c10.7-16.231,16.945-35.66,16.945-56.554C205.822,46.075,159.747,0,102.911,0S0,46.075,0,102.911 c0,56.835,46.074,102.911,102.91,102.911c20.895,0,40.323-6.245,56.554-16.945c0.269,0.301,0.47,0.64,0.759,0.929l54.38,54.38 c8.169,8.168,21.413,8.168,29.583,0C252.354,236.017,252.354,222.773,244.186,214.604z M102.911,170.146 c-37.134,0-67.236-30.102-67.236-67.235c0-37.134,30.103-67.236,67.236-67.236c37.132,0,67.235,30.103,67.235,67.236 C170.146,140.044,140.043,170.146,102.911,170.146z\"></path></svg>");
};




























var fields = config.get('textSearchOptions').fullTextSearchParameters;
buf.push("<div class=\"placeholder\">");
if ( fields != null && fields.length === 1)
{
buf.push("<header><h3>" + (jade.escape(null == (jade_interp = config.get('facetDisplayNames')[fields[0]]) ? "" : jade_interp)) + "</h3></header>");
}
buf.push("<div class=\"body\"><div class=\"search-input\"><input type=\"text\" name=\"search\"/><div class=\"search-icon\">");
jade_mixins["search-icon"]();
buf.push("</div></div><div class=\"menu\"><i class=\"fa fa-times\"></i><div class=\"close\"></div><ul class=\"options\">");
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
if ( fields != null && fields.length > 1)
{
buf.push("<li class=\"option fields\">");
textSearchId = generateId()
buf.push("<h4>" + (jade.escape(null == (jade_interp = config.get('labels').fullTextSearchParameters) ? "" : jade_interp)) + "</h4><ul class=\"fields\">");
// iterate fields
;(function(){
  var $$obj = fields;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var field = $$obj[i];

id = generateId()
buf.push("<li><input type=\"radio\"" + (jade.attr("checked", field==currentField?true:false, true, false)) + (jade.attr("name", "textsearchoptions-"+textSearchId, true, false)) + (jade.attr("id", id, true, false)) + " data-attr-array=\"fullTextSearchParameters\"" + (jade.attr("data-value", field, true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">" + (jade.escape(null == (jade_interp = config.get('facetDisplayNames')[field]) ? "" : jade_interp)) + "</label></li>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var field = $$obj[i];

id = generateId()
buf.push("<li><input type=\"radio\"" + (jade.attr("checked", field==currentField?true:false, true, false)) + (jade.attr("name", "textsearchoptions-"+textSearchId, true, false)) + (jade.attr("id", id, true, false)) + " data-attr-array=\"fullTextSearchParameters\"" + (jade.attr("data-value", field, true, false)) + "/><label" + (jade.attr("for", id, true, false)) + ">" + (jade.escape(null == (jade_interp = config.get('facetDisplayNames')[field]) ? "" : jade_interp)) + "</label></li>");
    }

  }
}).call(this);

buf.push("</ul></li>");
}
buf.push("</ul></div></div></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"currentField" in locals_for_with?locals_for_with.currentField:typeof currentField!=="undefined"?currentField:undefined,"generateId" in locals_for_with?locals_for_with.generateId:typeof generateId!=="undefined"?generateId:undefined,"id" in locals_for_with?locals_for_with.id:typeof id!=="undefined"?id:undefined,"model" in locals_for_with?locals_for_with.model:typeof model!=="undefined"?model:undefined,"textSearchId" in locals_for_with?locals_for_with.textSearchId:typeof textSearchId!=="undefined"?textSearchId:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":12}],44:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (displayName, options, ucfirst, undefined) {
buf.push("<ul>");
// iterate options
;(function(){
  var $$obj = options;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var option = $$obj[$index];

displayName = option.hasOwnProperty('displayName') ? option.displayName : option.name
buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade_interp = ucfirst(displayName)) ? "" : jade_interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade_interp = option.count) ? "" : jade_interp)) + "</div></div></div></li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var option = $$obj[$index];

displayName = option.hasOwnProperty('displayName') ? option.displayName : option.name
buf.push("<li><div class=\"row span6\"><div class=\"cell span5\"><i" + (jade.attr("data-value", option.name, true, false)) + (jade.cls([option.checked?'fa fa-check-square-o':'fa fa-square-o'], [true])) + "></i><label" + (jade.attr("data-value", option.name, true, false)) + ">" + (jade.escape(null == (jade_interp = ucfirst(displayName)) ? "" : jade_interp)) + "</label></div><div class=\"cell span1 alignright\"><div class=\"count\">" + (jade.escape(null == (jade_interp = option.count) ? "" : jade_interp)) + "</div></div></div></li>");
    }

  }
}).call(this);

buf.push("</ul>");}.call(this,"displayName" in locals_for_with?locals_for_with.displayName:typeof displayName!=="undefined"?displayName:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined,"ucfirst" in locals_for_with?locals_for_with.ucfirst:typeof ucfirst!=="undefined"?ucfirst:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
},{"jade/runtime":12}],45:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (config, model, options) {












jade_mixins["filter-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 971.986 971.986\"" + (jade.cls(['filter',attributes.className], [null,true])) + "><title>" + (jade.escape(null == (jade_interp = attributes.title) ? "" : jade_interp)) + "</title><path d=\"M370.216,459.3c10.2,11.1,15.8,25.6,15.8,40.6v442c0,26.601,32.1,40.101,51.1,21.4l123.3-141.3 c16.5-19.8,25.6-29.601,25.6-49.2V500c0-15,5.7-29.5,15.8-40.601L955.615,75.5c26.5-28.8,6.101-75.5-33.1-75.5h-873 c-39.2,0-59.7,46.6-33.1,75.5L370.216,459.3z\"></path></svg>");
};
jade_mixins["sort-count-ascending-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 511.627 511.627\"" + (jade.cls(['sort-count-ascending',attributes.className], [null,true])) + "><g><title>" + (jade.escape(null == (jade_interp = attributes.title) ? "" : jade_interp)) + "</title><rect x=\"0\" y=\"0\" width=\"511.627\" height=\"511.627\" fill-opacity=\"0.01\"></rect><path d=\"M260.494,219.271H388.4c2.666,0,4.855-0.855,6.563-2.57c1.715-1.713,2.573-3.9,2.573-6.567v-54.816 c0-2.667-0.858-4.854-2.573-6.567c-1.708-1.711-3.897-2.57-6.563-2.57H260.494c-2.666,0-4.853,0.855-6.567,2.57 c-1.71,1.713-2.568,3.9-2.568,6.567v54.816c0,2.667,0.855,4.854,2.568,6.567C255.641,218.413,257.828,219.271,260.494,219.271z\"></path><path d=\"M260.497,73.089h73.087c2.666,0,4.856-0.855,6.563-2.568c1.718-1.714,2.563-3.901,2.563-6.567V9.136 c0-2.663-0.846-4.853-2.563-6.567C338.44,0.859,336.25,0,333.584,0h-73.087c-2.666,0-4.853,0.855-6.567,2.568 c-1.709,1.715-2.568,3.905-2.568,6.567v54.818c0,2.666,0.855,4.853,2.568,6.567C255.645,72.23,257.831,73.089,260.497,73.089z\"></path><path d=\"M196.54,401.991h-54.817V9.136c0-2.663-0.854-4.856-2.568-6.567C137.441,0.859,135.254,0,132.587,0H77.769 c-2.663,0-4.856,0.855-6.567,2.568c-1.709,1.715-2.568,3.905-2.568,6.567v392.855H13.816c-4.184,0-7.04,1.902-8.564,5.708 c-1.525,3.621-0.855,6.95,1.997,9.996l91.361,91.365c2.094,1.707,4.281,2.562,6.567,2.562c2.474,0,4.665-0.855,6.567-2.562 l91.076-91.078c1.906-2.279,2.856-4.571,2.856-6.844c0-2.676-0.859-4.859-2.568-6.584 C201.395,402.847,199.208,401.991,196.54,401.991z\"></path><path d=\"M504.604,441.109c-1.715-1.718-3.901-2.573-6.567-2.573H260.497c-2.666,0-4.853,0.855-6.567,2.573 c-1.709,1.711-2.568,3.901-2.568,6.564v54.815c0,2.673,0.855,4.853,2.568,6.571c1.715,1.711,3.901,2.566,6.567,2.566h237.539 c2.666,0,4.853-0.855,6.567-2.566c1.711-1.719,2.566-3.898,2.566-6.571v-54.815C507.173,445.011,506.314,442.82,504.604,441.109z\"></path><path d=\"M260.494,365.445H443.22c2.663,0,4.853-0.855,6.57-2.566c1.708-1.711,2.563-3.901,2.563-6.563v-54.823 c0-2.662-0.855-4.853-2.563-6.563c-1.718-1.711-3.907-2.566-6.57-2.566H260.494c-2.666,0-4.853,0.855-6.567,2.566 c-1.71,1.711-2.568,3.901-2.568,6.563v54.823c0,2.662,0.855,4.853,2.568,6.563C255.641,364.59,257.828,365.445,260.494,365.445z\"></path></g></svg>");
};
jade_mixins["sort-count-descending-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 511.627 511.627\"" + (jade.cls(['sort-count-descending',attributes.className], [null,true])) + "><g><title>" + (jade.escape(null == (jade_interp = attributes.title) ? "" : jade_interp)) + "</title><rect x=\"0\" y=\"0\" width=\"511.627\" height=\"511.627\" fill-opacity=\"0\"></rect><path d=\"M333.584,438.536h-73.087c-2.666,0-4.853,0.855-6.567,2.573c-1.709,1.711-2.568,3.901-2.568,6.564v54.815 c0,2.673,0.855,4.853,2.568,6.571c1.715,1.711,3.901,2.566,6.567,2.566h73.087c2.666,0,4.856-0.855,6.563-2.566 c1.718-1.719,2.563-3.898,2.563-6.571v-54.815c0-2.663-0.846-4.854-2.563-6.564C338.44,439.392,336.25,438.536,333.584,438.536z\"></path><path d=\"M196.54,401.991h-54.817V9.136c0-2.663-0.854-4.856-2.568-6.567C137.441,0.859,135.254,0,132.587,0H77.769 c-2.663,0-4.856,0.855-6.567,2.568c-1.709,1.715-2.568,3.905-2.568,6.567v392.855H13.816c-4.184,0-7.04,1.902-8.564,5.708 c-1.525,3.621-0.855,6.95,1.997,9.996l91.361,91.365c2.094,1.707,4.281,2.562,6.567,2.562c2.474,0,4.665-0.855,6.567-2.562 l91.076-91.078c1.906-2.279,2.856-4.571,2.856-6.844c0-2.676-0.859-4.859-2.568-6.584 C201.395,402.847,199.208,401.991,196.54,401.991z\"></path><path d=\"M388.4,292.362H260.494c-2.666,0-4.853,0.855-6.567,2.566c-1.71,1.711-2.568,3.901-2.568,6.563v54.823 c0,2.662,0.855,4.853,2.568,6.563c1.714,1.711,3.901,2.566,6.567,2.566H388.4c2.666,0,4.855-0.855,6.563-2.566 c1.715-1.711,2.573-3.901,2.573-6.563v-54.823c0-2.662-0.858-4.853-2.573-6.563C393.256,293.218,391.066,292.362,388.4,292.362z\"></path><path d=\"M504.604,2.568C502.889,0.859,500.702,0,498.036,0H260.497c-2.666,0-4.853,0.855-6.567,2.568 c-1.709,1.715-2.568,3.905-2.568,6.567v54.818c0,2.666,0.855,4.853,2.568,6.567c1.715,1.709,3.901,2.568,6.567,2.568h237.539 c2.666,0,4.853-0.855,6.567-2.568c1.711-1.714,2.566-3.901,2.566-6.567V9.136C507.173,6.473,506.314,4.279,504.604,2.568z\"></path><path d=\"M443.22,146.181H260.494c-2.666,0-4.853,0.855-6.567,2.57c-1.71,1.713-2.568,3.9-2.568,6.567v54.816 c0,2.667,0.855,4.854,2.568,6.567c1.714,1.711,3.901,2.57,6.567,2.57H443.22c2.663,0,4.853-0.855,6.57-2.57 c1.708-1.713,2.563-3.9,2.563-6.567v-54.816c0-2.667-0.855-4.858-2.563-6.567C448.069,147.04,445.879,146.181,443.22,146.181z\"></path></g></svg>");
};
jade_mixins["sort-alphabetically-ascending-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 511.626 511.627\"" + (jade.cls(['sort-alphabetically-ascending',attributes.className], [null,true])) + "><g><title>" + (jade.escape(null == (jade_interp = attributes.title) ? "" : jade_interp)) + "</title><rect x=\"0\" y=\"0\" width=\"511.627\" height=\"511.627\" fill-opacity=\"0\"></rect><path d=\"M215.232,401.991h-54.818V9.136c0-2.663-0.854-4.856-2.568-6.567C156.133,0.859,153.946,0,151.279,0H96.461 c-2.663,0-4.856,0.855-6.567,2.568c-1.709,1.715-2.568,3.905-2.568,6.567v392.855H32.507c-4.184,0-7.039,1.902-8.563,5.708 c-1.525,3.621-0.856,6.95,1.997,9.996l91.361,91.365c2.096,1.707,4.281,2.562,6.567,2.562c2.474,0,4.664-0.855,6.567-2.562 l91.076-91.078c1.906-2.279,2.856-4.571,2.856-6.844c0-2.676-0.854-4.859-2.568-6.584 C220.086,402.847,217.9,401.991,215.232,401.991z\"></path><path d=\"M428.511,479.082h-70.808c-3.997,0-6.852,0.191-8.559,0.568l-4.001,0.571v-0.571l3.142-3.142 c2.848-3.419,4.853-5.896,5.996-7.409l105.344-151.331v-25.406H297.744v65.377h34.263v-32.832h66.236 c3.422,0,6.283-0.288,8.555-0.855c0.572,0,1.287-0.048,2.143-0.145c0.853-0.085,1.475-0.144,1.852-0.144v0.855l-3.142,2.574 c-1.704,1.711-3.713,4.273-5.995,7.706L296.31,485.934v25.693h166.734v-66.521h-34.54v33.976H428.511z\"></path><path d=\"M468.475,189.008L402.807,0h-46.25l-65.664,189.008h-19.979v30.264h81.933v-30.264h-21.409l13.419-41.112h69.381 l13.415,41.112H406.25v30.264h82.228v-30.264H468.475z M354.278,116.487l20.841-62.241c0.76-2.285,1.479-5.046,2.143-8.28 c0.66-3.236,0.996-4.949,0.996-5.139l0.855-5.708h1.143c0,0.761,0.191,2.664,0.562,5.708l3.433,13.418l20.554,62.241H354.278z\"></path></g></svg>");
};
jade_mixins["sort-alphabetically-descending-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 511.626 511.627\"" + (jade.cls(['sort-alphabetically-descending',attributes.className], [null,true])) + "><g><title>" + (jade.escape(null == (jade_interp = attributes.title) ? "" : jade_interp)) + "</title><rect x=\"0\" y=\"0\" width=\"511.627\" height=\"511.627\" fill-opacity=\"0\"></rect><path d=\"M215.232,401.991h-54.818V9.136c0-2.663-0.854-4.856-2.568-6.567C156.133,0.859,153.946,0,151.279,0H96.461 c-2.663,0-4.856,0.855-6.567,2.568c-1.709,1.715-2.568,3.905-2.568,6.567v392.855H32.507c-4.184,0-7.039,1.902-8.563,5.708 c-1.525,3.621-0.856,6.95,1.997,9.996l91.361,91.365c2.096,1.707,4.281,2.562,6.567,2.562c2.474,0,4.664-0.855,6.567-2.562 l91.076-91.078c1.906-2.279,2.856-4.571,2.856-6.844c0-2.676-0.854-4.859-2.568-6.584 C220.086,402.847,217.9,401.991,215.232,401.991z\"></path><path d=\"M468.475,481.361l-65.664-189.01h-46.25L290.9,481.364H270.92v30.263h81.934v-30.266h-21.412l13.418-41.11h69.381 l13.415,41.11H406.25v30.266h82.228v-30.266H468.475z M354.278,408.846l20.841-62.242c0.76-2.283,1.479-5.045,2.143-8.278 c0.66-3.234,0.996-4.948,0.996-5.137l0.855-5.715h1.143c0,0.767,0.191,2.669,0.562,5.715l3.433,13.415l20.554,62.242H354.278z\"></path><path d=\"M463.055,152.745h-34.537v33.975H357.71c-4.001,0-6.852,0.097-8.556,0.288l-4.004,0.854v-0.854l3.142-2.858 c2.851-3.422,4.853-5.896,5.996-7.421L459.632,25.41V0H297.754v65.387h34.259V32.552h66.232c3.426,0,6.283-0.288,8.56-0.859 c0.571,0,1.286-0.048,2.142-0.144c0.855-0.094,1.476-0.144,1.854-0.144v0.855l-3.141,2.568c-1.708,1.713-3.71,4.283-5.996,7.71 L296.32,193.569v25.697h166.735V152.745z\"></path></g></svg>");
};








options = model.get('options')
buf.push("<div class=\"placeholder\"><header><h3" + (jade.attr("title", model.get('title'), true, false)) + ">" + (jade.escape(null == (jade_interp = model.get('title')) ? "" : jade_interp)) + "</h3><div class=\"menu\">");
if ( options != null && options.length != null && options.length > 9)
{
jade_mixins["filter-icon"].call({
attributes: {"title": jade.escape(config.get('labels').filterOptions)}
});
jade_mixins["sort-count-ascending-icon"].call({
attributes: {"className": "count","title": jade.escape(config.get('labels').sortNumerically)}
});
jade_mixins["sort-count-descending-icon"].call({
attributes: {"className": "count visible active","title": jade.escape(config.get('labels').sortNumerically)}
});
jade_mixins["sort-alphabetically-ascending-icon"].call({
attributes: {"className": "alpha visible","title": jade.escape(config.get('labels').sortAlphabetically)}
});
jade_mixins["sort-alphabetically-descending-icon"].call({
attributes: {"className": "alpha","title": jade.escape(config.get('labels').sortAlphabetically)}
});
}
buf.push("</div><div class=\"options\"></div></header><div class=\"body\"></div></div>");}.call(this,"config" in locals_for_with?locals_for_with.config:typeof config!=="undefined"?config:undefined,"model" in locals_for_with?locals_for_with.model:typeof model!=="undefined"?model:undefined,"options" in locals_for_with?locals_for_with.options:typeof options!=="undefined"?options:undefined));;return buf.join("");
};
},{"jade/runtime":12}],46:[function(_dereq_,module,exports){
var jade = _dereq_("jade/runtime");

module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;

































jade_mixins["tail-spin-loader-icon"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<svg viewBox=\"0 0 38 38\"><defs><linearGradient x1=\"8.042%\" y1=\"0%\" x2=\"65.682%\" y2=\"23.865%\" id=\"z8dZZfS3A\"><stop stop-color=\"#666\" stop-opacity=\"0\" offset=\"0%\"></stop><stop stop-color=\"#666\" stop-opacity=\".631\" offset=\"63.146%\"></stop><stop stop-color=\"#666\" offset=\"100%\"></stop></linearGradient></defs><g fill=\"none\" fill-rule=\"evenodd\"><g transform=\"translate(1 1)\"><path d=\"M33 18c0-9.94-8.06-18-18-18\" stroke=\"url(#z8dZZfS3A)\" stroke-width=\"4\"><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 18 18\" to=\"360 18 18\" dur=\"0.9s\" repeatCount=\"indefinite\"></animateTransform></path><circle fill=\"#666\" cx=\"33\" cy=\"18\" r=\"2\"><animateTransform attributeName=\"transform\" type=\"rotate\" from=\"0 18 18\" to=\"360 18 18\" dur=\"0.9s\" repeatCount=\"indefinite\"></animateTransform></circle></g></g></svg>");
};




buf.push("<div class=\"overlay\"><div>");
jade_mixins["tail-spin-loader-icon"]();
buf.push("</div></div><div class=\"faceted-search\"><div class=\"text-search-placeholder\"></div><ul class=\"facets-menu\"><li class=\"reset\"><button><i class=\"fa fa-refresh\"></i><span>New search</span></button></li><li class=\"switch\"><button><i class=\"fa fa-angle-double-up\"></i><i class=\"fa fa-angle-double-down\"></i><span class=\"simple\">Simple search</span><span class=\"advanced\">Advanced search</span></button></li><li class=\"collapse-expand\"><button><i class=\"fa fa-compress\"></i><span>Collapse filters</span></button></li></ul><div class=\"facets-placeholder\"></div></div><div class=\"results\"></div>");;return buf.join("");
};
},{"jade/runtime":12}]},{},[1])(1)
});