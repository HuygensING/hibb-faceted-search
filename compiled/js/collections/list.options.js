(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var ListItems, Models;
    Models = {
      Option: require('models/list.option')
    };
    return ListItems = (function(_super) {
      __extends(ListItems, _super);

      function ListItems() {
        return ListItems.__super__.constructor.apply(this, arguments);
      }

      ListItems.prototype.model = Models.Option;

      ListItems.prototype.strategies = {
        alpha_asc: function(model) {
          return model.get('name');
        },
        alpha_desc: function(model) {
          return String.fromCharCode.apply(String, _.map(model.get('name').split(''), function(c) {
            return 0xffff - c.charCodeAt();
          }));
        },
        amount_asc: function(model) {
          return +model.get('count');
        },
        amount_desc: function(model) {
          return -1 * +model.get('count');
        }
      };

      ListItems.prototype.orderBy = function(strategy) {
        this.comparator = this.strategies[strategy];
        return this.sort();
      };

      ListItems.prototype.initialize = function() {
        return this.comparator = this.strategies.amount_desc;
      };

      ListItems.prototype.revert = function() {
        this.each((function(_this) {
          return function(option) {
            return option.set('checked', false, {
              silent: true
            });
          };
        })(this));
        return this.trigger('change');
      };

      ListItems.prototype.updateOptions = function(newOptions) {
        if (newOptions == null) {
          newOptions = [];
        }
        this.each((function(_this) {
          return function(option) {
            return option.set('count', 0, {
              silent: true
            });
          };
        })(this));
        _.each(newOptions, (function(_this) {
          return function(newOption) {
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
          };
        })(this));
        return this.sort();
      };

      return ListItems;

    })(Backbone.Collection);
  });

}).call(this);
