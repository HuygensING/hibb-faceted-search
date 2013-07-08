(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Backbone, BaseView, Pubsub, _ref;
    Backbone = require('backbone');
    Pubsub = require('managers/pubsub');
    return BaseView = (function(_super) {
      __extends(BaseView, _super);

      function BaseView() {
        _ref = BaseView.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      BaseView.prototype.initialize = function() {
        return _.extend(this, Pubsub);
      };

      return BaseView;

    })(Backbone.View);
  });

}).call(this);
