(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Facet, Views, tpls, _ref;
    Views = {
      Base: require('views/base')
    };
    tpls = require('tpls');
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
          'click header svg': 'toggleOptions'
        };
      };

      Facet.prototype.toggleOptions = function(ev) {
        var svg;
        svg = this.el.querySelector('header svg');
        if (svg.hasAttribute('class')) {
          svg.removeAttribute('class');
        } else {
          svg.setAttribute('class', 'active');
        }
        this.$('header .options').slideToggle();
        return this.$('header .options input[name="filter"]').focus();
      };

      Facet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = tpls['faceted-search/facets/main'](this.model.attributes);
        this.$el.html(rtpl);
        return this;
      };

      Facet.prototype.update = function(newOptions) {};

      return Facet;

    })(Views.Base);
  });

}).call(this);
