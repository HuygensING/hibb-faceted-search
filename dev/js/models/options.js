(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Backbone, Options, _ref;
    Backbone = require('backbone');
    Options = (function(_super) {
      __extends(Options, _super);

      function Options() {
        _ref = Options.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Options.prototype.defaults = {
        search: true,
        defaultQuery: {
          term: '*',
          facetValues: []
        }
      };

      return Options;

    })(Backbone.Model);
    return new Options();
  });

}).call(this);
