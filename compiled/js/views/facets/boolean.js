(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var BooleanFacet, Models, StringFn, Views, tpls, _ref;
    StringFn = require('hilib/functions/string');
    Models = {
      Boolean: require('models/boolean')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    return BooleanFacet = (function(_super) {
      __extends(BooleanFacet, _super);

      function BooleanFacet() {
        _ref = BooleanFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BooleanFacet.prototype.className = 'facet boolean';

      BooleanFacet.prototype.events = function() {
        return _.extend({}, BooleanFacet.__super__.events.apply(this, arguments), {
          'click i': 'checkChanged',
          'click label': 'checkChanged'
        });
      };

      BooleanFacet.prototype.checkChanged = function(ev) {
        var $target, option, value, _i, _len, _ref1;
        $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
        $target.toggleClass('fa-square-o');
        $target.toggleClass('fa-check-square-o');
        value = $target.attr('data-value');
        _ref1 = this.model.get('options');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          option = _ref1[_i];
          if (option.name === value) {
            option.checked = $target.hasClass('fa-check-square-o');
          }
        }
        return this.trigger('change', {
          facetValue: {
            name: this.model.get('name'),
            values: _.map(this.$('i.fa-check-square-o'), function(cb) {
              return cb.getAttribute('data-value');
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
        rtpl = tpls['faceted-search/facets/boolean.body'](_.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.body').html(rtpl);
        this.$('header i.fa').remove();
        return this;
      };

      BooleanFacet.prototype.update = function(newOptions) {
        return this.model.set('options', newOptions);
      };

      BooleanFacet.prototype.reset = function() {
        return this.render();
      };

      return BooleanFacet;

    })(Views.Facet);
  });

}).call(this);
