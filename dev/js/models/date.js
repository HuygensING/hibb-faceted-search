(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var DateFacet, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    return DateFacet = (function(_super) {
      __extends(DateFacet, _super);

      function DateFacet() {
        _ref = DateFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      DateFacet.prototype.parse = function(attrs) {
        attrs.options = _.map(_.pluck(attrs.options, 'name'), function(option) {
          return option.substr(0, 4);
        });
        attrs.options = _.unique(attrs.options);
        attrs.options.sort();
        return attrs;
      };

      return DateFacet;

    })(Models.Facet);
  });

}).call(this);
