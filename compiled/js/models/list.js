(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var List, Models, _ref;
    Models = {
      Facet: require('models/facet')
    };
    return List = (function(_super) {
      __extends(List, _super);

      function List() {
        _ref = List.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      return List;

    })(Models.Facet);
  });

}).call(this);
