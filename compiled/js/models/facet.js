(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Facet, Models, config, _ref;
    config = require('config');
    Models = {
      Base: require('models/base')
    };
    return Facet = (function(_super) {
      __extends(Facet, _super);

      function Facet() {
        _ref = Facet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Facet.prototype.idAttribute = 'name';

      Facet.prototype.parse = function(attrs) {
        if ((attrs.title == null) || attrs.title === '' && (config.facetNameMap[attrs.name] != null)) {
          attrs.title = config.facetNameMap[attrs.name];
        }
        return attrs;
      };

      return Facet;

    })(Backbone.Model);
  });

}).call(this);
