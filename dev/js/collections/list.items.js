(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, ListItems, Models, _ref;
    Models = {
      ListItem: require('models/list.item')
    };
    Collections = {
      Base: require('collections/base')
    };
    return ListItems = (function(_super) {
      __extends(ListItems, _super);

      function ListItems() {
        _ref = ListItems.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListItems.prototype.model = Models.ListItem;

      return ListItems;

    })(Collections.Base);
  });

}).call(this);
