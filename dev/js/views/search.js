(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, Search, Templates, Views, _ref;
    Models = {
      query: require('models/query')
    };
    Views = {
      Facet: require('views/facet')
    };
    Templates = {
      Search: require('text!html/search.html')
    };
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.events = {
        'click button.search': 'search'
      };

      Search.prototype.search = function(ev) {
        var _this = this;
        ev.preventDefault();
        this.$('#search').addClass('loading');
        return Models.query.fetch({
          term: this.$('input#search').val(),
          textLayers: ['Diplomatic']
        }, function(results) {
          _this.$('#search').removeClass('loading');
          return _this.publish('faceted-search:results', results);
        });
      };

      Search.prototype.initialize = function() {
        Search.__super__.initialize.apply(this, arguments);
        return this.render();
      };

      Search.prototype.render = function() {
        var rtpl;
        Search.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.Search);
        this.$('.placeholder').html(rtpl);
        return this;
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);
