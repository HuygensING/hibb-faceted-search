(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, Search, Templates, Views, config, _ref;
    config = require('config');
    Models = {
      Search: require('models/search')
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
        'click header small': 'toggleOptions',
        'click button.search': 'search'
      };

      Search.prototype.toggleOptions = function(ev) {
        return this.$('.options').slideToggle();
      };

      Search.prototype.search = function(ev) {
        var _this = this;
        ev.preventDefault();
        this.$('#search').addClass('loading');
        this.trigger('change', {
          term: this.$('#search').val()
        });
        return this.subscribe('faceted-search:results', function() {
          return _this.$('#search').removeClass('loading');
        });
      };

      Search.prototype.initialize = function(options) {
        Search.__super__.initialize.apply(this, arguments);
        this.model = new Models.Search(config.textSearchOptions);
        console.log(this.model.attributes);
        return this.render();
      };

      Search.prototype.render = function() {
        var checkboxes, rtpl,
          _this = this;
        Search.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.Search, {
          searchOptions: this.model.attributes
        });
        this.$('.placeholder').html(rtpl);
        checkboxes = this.$(':checkbox');
        checkboxes.change(function(ev) {
          _.each(checkboxes, function(cb) {
            var checked, prop;
            prop = cb.getAttribute('data-prop');
            console.log(prop);
            if (prop != null) {
              checked = $(cb).attr('checked') === 'checked' ? true : false;
              console.log(cb.checked);
              return _this.model.set(prop, checked);
            }
          });
          return console.log(_this.model.attributes);
        });
        return this;
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);
