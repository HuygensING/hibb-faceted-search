(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, ListItems, Models, _ref;
    Models = {
      Option: require('models/list.option')
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

      ListItems.prototype.model = Models.Option;

      ListItems.prototype.strategies = {
        name: function(model) {
          return model.get('name');
        },
        name_opposite: function(model) {
          return String.fromCharCode.apply(String, _.map(model.get('name').split(''), function(c) {
            return 0xffff - c.charCodeAt();
          }));
        },
        count: function(model) {
          return -1 * +model.get('count');
        },
        count_opposite: function(model) {
          return +model.get('count');
        }
      };

      ListItems.prototype.orderBy = function(strategy) {
        this.comparator = this.strategies[strategy];
        return this.sort();
      };

      ListItems.prototype.initialize = function() {
        return this.comparator = this.strategies.count;
      };

      ListItems.prototype.revert = function() {
        var _this = this;
        this.each(function(option) {
          return option.set('checked', false, {
            silent: true
          });
        });
        return this.trigger('change');
      };

      ListItems.prototype.updateOptions = function(newOptions) {
        var _this = this;
        if (newOptions == null) {
          newOptions = [];
        }
        this.each(function(option) {
          return option.set('count', 0, {
            silent: true
          });
        });
        _.each(newOptions, function(newOption) {
          var opt;
          opt = _this.get(newOption.name);
          if (opt != null) {
            return opt.set('count', newOption.count, {
              silent: true
            });
          } else {
            opt = new Models.Option(newOption);
            return _this.add(opt);
          }
        });
        return this.sort();
      };

      return ListItems;

    })(Collections.Base);
  });

}).call(this);
