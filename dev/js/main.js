(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, Templates, Views, _ref;
    Models = {
      query: require('models/query')
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
        var _this = this;
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.options = _.extend(this.defaultOptions(), options);
        Models.query.baseUrl = this.options.baseUrl;
        Models.query.searchUrl = this.options.searchUrl;
        Models.query.token = this.options.token;
        this.subscribe('faceted-search:results', function(results) {
          _this.renderFacets(results);
          return _this.trigger('faceted-search:results', results);
        });
        this.subscribe('facet:list:changed', function(data) {
          return Models.query.addFacetValues(data);
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
        var index, list, _ref1, _results;
        this.$('.facets').html('');
        _ref1 = data.facets;
        _results = [];
        for (index in _ref1) {
          if (!__hasProp.call(_ref1, index)) continue;
          data = _ref1[index];
          list = new Views.List({
            attrs: data
          });
          _results.push(this.$('.facets').append(list.$el));
        }
        return _results;
      };

      return FacetedSearch;

    })(Views.Base);
  });

}).call(this);
