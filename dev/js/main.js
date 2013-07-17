(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, Templates, Views, _ref;
    Models = {
      FacetedSearch: require('models/main')
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

      FacetedSearch.prototype.facetData = [];

      FacetedSearch.prototype.facetViews = {};

      FacetedSearch.prototype.initialize = function(options) {
        var _this = this;
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.model = new Models.FacetedSearch(options);
        this.subscribe('unauthorized', function() {
          return _this.trigger('unauthorized');
        });
        return this.render();
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, search;
        rtpl = _.template(Templates.FacetedSearch);
        this.$el.html(rtpl);
        if (this.model.get('search')) {
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
        this.model.setQueryOptions(queryOptions);
        return this.model.fetch({
          success: function(model, response, options) {
            _this.renderFacets(response);
            return _this.trigger('faceted-search:results', response);
          }
        });
      };

      FacetedSearch.prototype.renderFacets = function(data) {
        var index, _ref1, _ref2;
        if (!this.facetData.length) {
          this.facetData = data.facets;
          _ref1 = data.facets;
          for (index in _ref1) {
            if (!__hasProp.call(_ref1, index)) continue;
            data = _ref1[index];
            this.facetViews[data.name] = new Views.List({
              attrs: data
            });
            this.listenTo(this.facetViews[data.name], 'change', this.fetchResults);
            this.$('.facets').append(this.facetViews[data.name].$el);
          }
        } else {
          _ref2 = data.facets;
          for (index in _ref2) {
            if (!__hasProp.call(_ref2, index)) continue;
            data = _ref2[index];
            this.facetViews[data.name].update(data.options);
          }
        }
        return this.publish('faceted-search:facets-rendered');
      };

      return FacetedSearch;

    })(Views.Base);
  });

}).call(this);
