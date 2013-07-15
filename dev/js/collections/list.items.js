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

      ListItems.prototype.comparator = function(model) {
        return -1 * parseInt(model.get('count'), 10);
      };

      ListItems.prototype.updateOptions = function(newOptions) {
        var _this = this;
        this.each(function(option) {
          return option.set('count', 0);
        });
        _.each(newOptions, function(newOption) {
          var opt;
          if (newOption.name === '') {
            newOption.name = '<i>(empty)</i>';
          }
          opt = _this.get(newOption.name);
          return opt.set('count', newOption.count);
        });
        return this.sort();
      };

      return ListItems;

    })(Collections.Base);
  });

}).call(this);
