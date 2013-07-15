(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, Templates, Views, _ref;
    Models = {
      query: require('models/query'),
      options: require('models/options')
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
        Models.query.baseUrl = this.options.baseUrl;
        Models.query.searchUrl = this.options.searchUrl;
        Models.query.token = this.options.token;
        this.subscribe('faceted-search:results', function(results) {
          _this.renderFacets(results);
          return _this.trigger('faceted-search:results', results);
        });
        return this.render();
      };

      FacetedSearch.prototype.render = function() {
        var rtpl, search;
        rtpl = _.template(Templates.FacetedSearch);
        this.$el.html(rtpl);
        if (this.options.search) {
          search = new Views.Search();
          this.$('.search-placeholder').html(search.$el);
        }
        Models.query.fetch();
        return this;
      };

      FacetedSearch.prototype.renderFacets = function(data) {
        var index, _ref1, _ref2, _results, _results1;
        if (!this.facetData.length) {
          this.facetData = data.facets;
          _ref1 = data.facets;
          _results = [];
          for (index in _ref1) {
            if (!__hasProp.call(_ref1, index)) continue;
            data = _ref1[index];
            this.facetViews[data.name] = new Views.List({
              attrs: data
            });
            _results.push(this.$('.facets').append(this.facetViews[data.name].$el));
          }
          return _results;
        } else {
          _ref2 = data.facets;
          _results1 = [];
          for (index in _ref2) {
            if (!__hasProp.call(_ref2, index)) continue;
            data = _ref2[index];
            _results1.push(this.facetViews[data.name].update(data.options));
          }
          return _results1;
        }
      };

      return FacetedSearch;

    })(Views.Base);
  });

}).call(this);
