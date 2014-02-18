(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var BooleanFacet, Models;
    Models = {
      Facet: require('models/facet')
    };
    return BooleanFacet = (function(_super) {
      __extends(BooleanFacet, _super);

      function BooleanFacet() {
        return BooleanFacet.__super__.constructor.apply(this, arguments);
      }

      BooleanFacet.prototype.set = function(attrs, options) {
        if (attrs === 'options') {
          options = this.parseOptions(options);
        } else if (attrs.options != null) {
          attrs.options = this.parseOptions(attrs.options);
        }
        return BooleanFacet.__super__.set.call(this, attrs, options);
      };

      BooleanFacet.prototype.parseOptions = function(options) {
        var _ref;
        options = (_ref = this.get('options')) != null ? _ref : options;
        if (options.length === 1) {
          options.push({
            name: (!JSON.parse(options[0].name)).toString(),
            count: 0
          });
        }
        return options;
      };

      return BooleanFacet;

    })(Models.Facet);
  });

}).call(this);
