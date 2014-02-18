(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, RangeFacet;
    Models = {
      Facet: require('models/facet')
    };
    return RangeFacet = (function(_super) {
      __extends(RangeFacet, _super);

      function RangeFacet() {
        return RangeFacet.__super__.constructor.apply(this, arguments);
      }

      RangeFacet.prototype.parse = function(attrs) {
        RangeFacet.__super__.parse.apply(this, arguments);
        attrs.options = {
          lowerLimit: +((attrs.options[0].lowerLimit + '').substr(0, 4)),
          upperLimit: +((attrs.options[0].upperLimit + '').substr(0, 4))
        };
        return attrs;
      };

      return RangeFacet;

    })(Models.Facet);
  });

}).call(this);
