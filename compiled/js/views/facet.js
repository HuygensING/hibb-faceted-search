(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
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

      Facet.prototype.initialize = function() {
        return Facet.__super__.initialize.apply(this, arguments);
      };

      Facet.prototype.events = function() {
        return {
          'click h3': 'toggleBody',
          'click header small': 'toggleOptions'
        };
      };

      Facet.prototype.toggleOptions = function(ev) {
        this.$('header small').toggleClass('active');
        this.$('header .options').slideToggle();
        return this.$('.options .listsearch').focus();
      };

      Facet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = _.template(Templates.Facet, this.model.attributes);
        this.$el.html(rtpl);
        return this;
      };

      Facet.prototype.update = function(newOptions) {};

      return Facet;

    })(Views.Base);
  });

}).call(this);
