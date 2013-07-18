(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var BooleanFacet, Models, StringFn, Templates, Views, _ref;
    StringFn = require('helpers/string');
    Models = {
      Boolean: require('models/boolean')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      List: require('text!html/facet/boolean.html')
    };
    return BooleanFacet = (function(_super) {
      __extends(BooleanFacet, _super);

      function BooleanFacet() {
        _ref = BooleanFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BooleanFacet.prototype.className = 'facet boolean';

      BooleanFacet.prototype.events = function() {
        return {
          'change input[type="checkbox"]': 'checkChanged',
          'click h3': 'toggleBody'
        };
      };

      BooleanFacet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      BooleanFacet.prototype.checkChanged = function(ev) {
        return this.trigger('change', {
          facetValue: {
            name: this.model.get('name'),
            values: _.map(this.$('input:checked'), function(input) {
              return input.getAttribute('data-value');
            })
          }
        });
      };

      BooleanFacet.prototype.initialize = function(options) {
        BooleanFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.Boolean(options.attrs, {
          parse: true
        });
        this.listenTo(this.model, 'change:options', this.render);
        return this.render();
      };

      BooleanFacet.prototype.render = function() {
        var rtpl;
        BooleanFacet.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.List, _.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.placeholder').html(rtpl);
        return this;
      };

      BooleanFacet.prototype.update = function(newOptions) {
        return this.model.set('options', newOptions);
      };

      return BooleanFacet;

    })(Views.Facet);
  });

}).call(this);
