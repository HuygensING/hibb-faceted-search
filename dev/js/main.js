(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, Templates, Views, config, facetViewMap, _ref;
    config = require('config');
    facetViewMap = require('facetviewmap');
    Models = {
      FacetedSearch: require('models/main')
    };
    Views = {
      Base: require('views/base'),
      Search: require('views/search'),
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
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.facetViews = {};
        this.firstRender = true;
        _.extend(facetViewMap, options.facetViewMap);
        delete options.facetViewMap;
        _.extend(config.facetNameMap, options.facetNameMap);
        delete options.facetNameMap;
        _.extend(config, options);
        queryOptions = _.extend(config.queryOptions, config.textSearchOptions);
        this.model = new Models.FacetedSearch(queryOptions);
        this.subscribe('unauthorized', function() {
          return _this.trigger('unauthorized');
        });
        this.subscribe('results:change', function(response) {
          return _this.trigger('results:change', response);
        });
        return this.render();
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, search;
        rtpl = _.template(Templates.FacetedSearch);
        this.$el.html(rtpl);
        this.$('.loader').fadeIn('slow');
        if (config.search) {
          search = new Views.Search();
          this.$('.search-placeholder').html(search.$el);
          this.listenTo(search, 'change', this.fetchResults);
        }
        this.fetchResults();
        return this;
      };

      FacetedSearch.prototype.fetchResults = function(queryOptions) {
        var _this = this;
        if (queryOptions == null) {
          queryOptions = {};
        }
        this.model.set(queryOptions);
        return this.model.fetch({
          success: function() {
            return _this.renderFacets();
          }
        });
      };

      FacetedSearch.prototype.renderFacets = function(data) {
        var View, facetData, fragment, index, _ref1, _ref2, _results;
        this.$('.loader').hide();
        if (this.firstRender) {
          this.firstRender = false;
          fragment = document.createDocumentFragment();
          _ref1 = this.model.serverResponse.facets;
          for (index in _ref1) {
            if (!__hasProp.call(_ref1, index)) continue;
            facetData = _ref1[index];
            if (facetData.type in facetViewMap) {
              View = facetViewMap[facetData.type];
              this.facetViews[facetData.name] = new View({
                attrs: facetData
              });
              this.listenTo(this.facetViews[facetData.name], 'change', this.fetchResults);
              fragment.appendChild(this.facetViews[facetData.name].el);
            } else {
              console.error('Unknown facetView', facetData.type);
            }
          }
          return this.$('.facets').html(fragment);
        } else {
          _ref2 = this.model.serverResponse.facets;
          _results = [];
          for (index in _ref2) {
            if (!__hasProp.call(_ref2, index)) continue;
            data = _ref2[index];
            _results.push(this.facetViews[data.name].update(data.options));
          }
          return _results;
        }
      };

      /* PUBLIC METHODS*/


      FacetedSearch.prototype.next = function() {
        return this.model.setCursor('_next');
      };

      FacetedSearch.prototype.prev = function() {
        return this.model.setCursor('_prev');
      };

      FacetedSearch.prototype.hasNext = function() {
        return _.has(this.model.serverResponse, '_next');
      };

      FacetedSearch.prototype.hasPrev = function() {
        return _.has(this.model.serverResponse, '_prev');
      };

      FacetedSearch.prototype.sortResultsBy = function(facet) {
        return this.model.set({
          sort: facet
        });
      };

      return FacetedSearch;

    })(Views.Base);
  });

}).call(this);
