(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Search;
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        return Search.__super__.constructor.apply(this, arguments);
      }

      Search.prototype.defaults = function() {
        return {
          term: '*',
          caseSensitive: false,
          fuzzy: false,
          title: 'Text Search',
          name: 'text_search'
        };
      };

      Search.prototype.queryData = function() {
        var attrs;
        attrs = _.extend({}, this.attributes);
        delete attrs.name;
        delete attrs.title;
        return attrs;
      };

      return Search;

    })(Backbone.Model);
  });

}).call(this);
