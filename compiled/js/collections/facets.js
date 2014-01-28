(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Facets, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    Facets = (function(_super) {
      __extends(Facets, _super);

      function Facets() {
        _ref = Facets.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Facets.prototype.model = Models.Facet;

      return Facets;

    })(Backbone.Collection);
    return new Facets();
  });

}).call(this);
