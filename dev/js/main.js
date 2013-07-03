(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
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
        this.model.set('url', this.options.url);
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
