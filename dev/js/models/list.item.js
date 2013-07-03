(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var ListItem, Models, _ref;
    Models = {
      Base: require('models/base')
    };
    return ListItem = (function(_super) {
      __extends(ListItem, _super);

      function ListItem() {
        _ref = ListItem.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListItem.prototype.parse = function(attrs) {
        if (!attrs.name) {
          attrs.name = '<i>empty</i>';
        }
        return attrs;
      };

      return ListItem;

    })(Models.Base);
  });

}).call(this);
