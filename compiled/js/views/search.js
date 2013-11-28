(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, Search, Views, config, tpls, _ref;
    config = require('config');
    Models = {
      Search: require('models/search')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    return Search = (function(_super) {
      __extends(Search, _super);

      function Search() {
        _ref = Search.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Search.prototype.className = 'facet search';

      Search.prototype.initialize = function(options) {
        var _this = this;
        Search.__super__.initialize.apply(this, arguments);
        this.model = new Models.Search(config.textSearchOptions);
        this.listenTo(this.model, 'change', function() {
          return _this.trigger('change', _this.model.queryData());
        });
        return this.render();
      };

      Search.prototype.render = function() {
        var body, menu;
        Search.__super__.render.apply(this, arguments);
        console.log(this.model.attributes);
        menu = tpls['faceted-search/facets/search.menu']({
          model: this.model
        });
        body = tpls['faceted-search/facets/search.body']({
          model: this.model
        });
        this.$('.options').html(menu);
        this.$('.body').html(body);
        return this;
      };

      Search.prototype.events = function() {
        return _.extend({}, Search.__super__.events.apply(this, arguments), {
          'click button': function(ev) {
            return ev.preventDefault();
          },
          'click button.active': 'search',
          'keyup input': 'activateSearchButton',
          'change input[type="checkbox"]': 'checkboxChanged'
        });
      };

      Search.prototype.checkboxChanged = function(ev) {
        var attr, cb, checkedArray, _i, _len, _ref1;
        if (attr = ev.currentTarget.getAttribute('data-attr')) {
          this.model.set(attr, ev.currentTarget.checked);
        } else if (attr = ev.currentTarget.getAttribute('data-attr-array')) {
          checkedArray = [];
          _ref1 = this.el.querySelectorAll('[data-attr-array="' + attr + '"]');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            cb = _ref1[_i];
            if (cb.checked) {
              checkedArray.push(cb.getAttribute('data-value'));
            }
          }
          this.model.set(attr, checkedArray);
        }
        return this.activateSearchButton(true);
      };

      Search.prototype.activateSearchButton = function(checkboxChanged) {
        var inputValue;
        if (checkboxChanged == null) {
          checkboxChanged = false;
        }
        if (checkboxChanged.hasOwnProperty('target')) {
          checkboxChanged = false;
        }
        inputValue = this.el.querySelector('input[name="search"]').value;
        if (inputValue.length > 1 && (this.model.get('term') !== inputValue || checkboxChanged)) {
          return this.$('button').addClass('active');
        } else {
          return this.$('button').removeClass('active');
        }
      };

      Search.prototype.search = function(ev) {
        var $search, inputValue;
        ev.preventDefault();
        this.$('button').removeClass('active');
        $search = this.$('input[name="search"]');
        $search.addClass('loading');
        inputValue = this.el.querySelector('input[name="search"]').value;
        return this.model.set('term', inputValue);
      };

      Search.prototype.update = function() {
        return this.$('input[name="search"]').removeClass('loading');
      };

      Search.prototype.reset = function() {
        return this.render();
      };

      return Search;

    })(Views.Facet);
  });

}).call(this);
