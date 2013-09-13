(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var DateFacet, Models, StringFn, Templates, Views, _ref;
    StringFn = require('helpers/string');
    Models = {
      Date: require('models/date')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Date: require('text!html/facet/date.html')
    };
    return DateFacet = (function(_super) {
      __extends(DateFacet, _super);

      function DateFacet() {
        _ref = DateFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      DateFacet.prototype.className = 'facet date';

      DateFacet.prototype.initialize = function(options) {
        DateFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.Date(options.attrs, {
          parse: true
        });
        this.listenTo(this.model, 'change:options', this.render);
        return this.render();
      };

      DateFacet.prototype.render = function() {
        var rtpl;
        DateFacet.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.Date, _.extend(this.model.attributes, {
          ucfirst: StringFn.ucfirst
        }));
        this.$('.placeholder').html(rtpl);
        return this;
      };

      DateFacet.prototype.update = function(newOptions) {};

      return DateFacet;

    })(Views.Facet);
  });

}).call(this);
