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

      Facet.prototype.render = function() {
        var rtpl;
        rtpl = tpls['faceted-search/facets/main'](this.model.attributes);
        this.$el.html(rtpl);
        return this;
      };

      Facet.prototype.events = function() {
        return {
          'click h3': 'toggleBody',
          'click header i.fa': 'toggleMenu'
        };
      };

      Facet.prototype.toggleMenu = function(ev) {
        var $button;
        $button = $(ev.currentTarget);
        $button.toggleClass('fa-plus-square-o');
        $button.toggleClass('fa-minus-square-o');
        this.$('header .options').slideToggle(150);
        return this.$('header .options input[name="filter"]').focus();
      };

      Facet.prototype.hideMenu = function() {
        var $button;
        $button = $('header i.fa');
        $button.addClass('fa-plus-square-o');
        $button.removeClass('fa-minus-square-o');
        return this.$('header .options').slideUp(150);
      };

      Facet.prototype.toggleBody = function(ev) {
        var func;
        func = this.$('.body').is(':visible') ? this.hideBody : this.showBody;
        if (_.isFunction(ev)) {
          return func.call(this, ev);
        } else {
          return func.call(this);
        }
      };

      Facet.prototype.hideBody = function(done) {
        var _this = this;
        this.hideMenu();
        return this.$('.body').slideUp(100, function() {
          if (done != null) {
            done();
          }
          return _this.$('header i.fa').fadeOut(100);
        });
      };

      Facet.prototype.showBody = function(done) {
        var _this = this;
        return this.$('.body').slideDown(100, function() {
          if (done != null) {
            done();
          }
          return _this.$('header i.fa').fadeIn(100);
        });
      };

      Facet.prototype.update = function(newOptions) {};

      return Facet;

    })(Views.Base);
  });

}).call(this);
