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

  define(function(require) {
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
        this.subscribe('unauthorized', function() {
          return _this.trigger('unauthorized');
        });
        this.subscribe('change:results', function(responseModel, queryOptions) {
          _this.renderFacets();
          return _this.trigger('results:change', responseModel, queryOptions);
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
        var View, facetData, fragment, index, _ref1, _ref2, _results,
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
          return this.$('.facets').html(fragment);
        } else {
          if (this.facetViews.hasOwnProperty('textSearch')) {
            this.facetViews['textSearch'].update();
          }
          _ref2 = this.model.searchResults.current.get('facets');
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
