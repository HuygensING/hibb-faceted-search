(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var BaseView, FacetMenu, Models, config, tpls, _ref;
    config = require('config');
    Models = {
      Search: require('models/search')
    };
    BaseView = require('views/base');
    tpls = require('tpls');
    return FacetMenu = (function(_super) {
      __extends(FacetMenu, _super);

      function FacetMenu() {
        _ref = FacetMenu.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetMenu.prototype.className = 'facet menu';

      FacetMenu.prototype.initialize = function() {
        FacetMenu.__super__.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change', this.renderSelected);
        return this.render();
      };

      FacetMenu.prototype.render = function() {
        var rtpl;
        rtpl = tpls['faceted-search/facet-menu']();
        this.$el.html(rtpl);
        return this;
      };

      FacetMenu.prototype.renderSelected = function(queryOptions) {
        var facetValue, facetValues, rtpl, _i, _len, _results;
        facetValues = queryOptions.get('facetValues');
        this.$('ul.selected-facet-values').html('');
        _results = [];
        for (_i = 0, _len = facetValues.length; _i < _len; _i++) {
          facetValue = facetValues[_i];
          rtpl = tpls['faceted-search/facet-menu.selected']({
            facet: facetValue,
            map: config.facetNameMap
          });
          _results.push(this.$('ul.selected-facet-values').append(rtpl));
        }
        return _results;
      };

      FacetMenu.prototype.events = function() {};

      FacetMenu.prototype.update = function() {};

      FacetMenu.prototype.reset = function() {};

      return FacetMenu;

    })(BaseView);
  });

}).call(this);
