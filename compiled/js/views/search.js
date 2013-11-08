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
      Menu: require('text!html/facet/search.menu.html'),
      Body: require('text!html/facet/search.body.html')
    };
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.initialize = function(options) {
        Search.__super__.initialize.apply(this, arguments);
        this.currentSearchText = null;
        this.model = new Models.Search({
          searchOptions: config.textSearchOptions,
          title: 'Text search',
          name: 'text_search'
        });
        return this.render();
      };

      Search.prototype.render = function() {
        var body, checkboxes, menu,
          _this = this;
        Search.__super__.render.apply(this, arguments);
        menu = _.template(Templates.Menu, this.model.attributes);
        body = _.template(Templates.Body, this.model.attributes);
        this.$('.options').html(menu);
        this.$('.body').html(body);
        checkboxes = this.$(':checkbox');
        checkboxes.change(function(ev) {
          return _.each(checkboxes, function(cb) {
            var checked, prop;
            prop = cb.getAttribute('data-prop');
            if (prop != null) {
              checked = $(cb).attr('checked') === 'checked' ? true : false;
              return _this.model.set(prop, checked);
            }
          });
        });
        return this;
      };

      Search.prototype.events = function() {
        return _.extend({}, Search.__super__.events.apply(this, arguments), {
          'click button': function(ev) {
            return ev.preventDefault();
          },
          'click button.active': 'search',
          'keyup input': 'onKeyup'
        });
      };

      Search.prototype.onKeyup = function(ev) {
        if (ev.currentTarget.value.length > 1 && this.currentSearchText !== ev.currentTarget.value) {
          return this.$('button').addClass('active');
        } else {
          return this.$('button').removeClass('active');
        }
      };

      Search.prototype.search = function(ev) {
        var $search;
        ev.preventDefault();
        this.$('button').removeClass('active');
        $search = this.$('#search');
        $search.addClass('loading');
        this.currentSearchText = $search.val();
        return this.trigger('change', {
          term: this.currentSearchText
        });
      };

      Search.prototype.update = function() {
        return this.$('#search').removeClass('loading');
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);
