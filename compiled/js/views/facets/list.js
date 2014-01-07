(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, Fn, ListFacet, Models, Views, tpls, _ref;
    Fn = require('hilib/functions/general');
    Models = {
      List: require('models/list')
    };
    Collections = {
      Options: require('collections/list.options')
    };
    Views = {
      Facet: require('views/facets/main'),
      Options: require('views/facets/list.options')
    };
    tpls = require('tpls');
    return ListFacet = (function(_super) {
      __extends(ListFacet, _super);

      function ListFacet() {
        _ref = ListFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListFacet.prototype.className = 'facet list';

      ListFacet.prototype.events = function() {
        return _.extend({}, ListFacet.__super__.events.apply(this, arguments), {
          'keyup input[name="filter"]': function(ev) {
            return this.optionsView.filterOptions(ev.currentTarget.value);
          },
          'change header .options input[type="checkbox"][name="all"]': 'selectAll',
          'click .orderby span': 'changeOrder'
        });
      };

      ListFacet.prototype.changeOrder = function(ev) {
        var $target, strategy;
        $target = $(ev.currentTarget);
        if ($target.hasClass('active')) {
          $target.toggleClass('opposite');
        } else {
          this.$('.orderby span.active').removeClass('active opposite');
          $target.addClass('active');
        }
        strategy = $target.hasClass('name') ? 'name' : 'count';
        if ($target.hasClass('opposite')) {
          strategy += '_opposite';
        }
        return this.collection.orderBy(strategy);
      };

      ListFacet.prototype.selectAll = function(ev) {
        var cb, checkboxes, _i, _len, _results;
        checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        _results = [];
        for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
          cb = checkboxes[_i];
          _results.push(cb.checked = ev.currentTarget.checked);
        }
        return _results;
      };

      ListFacet.prototype.initialize = function(options) {
        this.options = options;
        ListFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.List(this.options.attrs, {
          parse: true
        });
        return this.render();
      };

      ListFacet.prototype.render = function() {
        var body, menu,
          _this = this;
        ListFacet.__super__.render.apply(this, arguments);
        menu = tpls['faceted-search/facets/list.menu'](this.model.attributes);
        body = tpls['faceted-search/facets/list.body'](this.model.attributes);
        this.el.querySelector('header .options').innerHTML = menu;
        this.el.querySelector('.body').innerHTML = body;
        this.collection = new Collections.Options(this.options.attrs.options, {
          parse: true
        });
        this.optionsView = new Views.Options({
          collection: this.collection,
          facetName: this.model.get('name')
        });
        this.$('.body').html(this.optionsView.el);
        this.listenTo(this.optionsView, 'filter:finished', this.renderFilteredOptionCount);
        this.listenTo(this.optionsView, 'change', function(data) {
          return _this.trigger('change', data);
        });
        return this;
      };

      ListFacet.prototype.renderFilteredOptionCount = function() {
        var collectionLength, filteredLength;
        filteredLength = this.optionsView.filtered_items.length;
        collectionLength = this.optionsView.collection.length;
        if (filteredLength === 0 || filteredLength === collectionLength) {
          this.$('header .options input[name="filter"]').addClass('nonefound');
          this.$('header small.optioncount').html('');
        } else {
          this.$('header .options input[name="filter"]').removeClass('nonefound');
          this.$('header small.optioncount').html(filteredLength + ' of ' + collectionLength);
        }
        return this;
      };

      ListFacet.prototype.update = function(newOptions) {
        return this.optionsView.collection.updateOptions(newOptions);
      };

      ListFacet.prototype.reset = function() {
        return this.optionsView.collection.revert();
      };

      return ListFacet;

    })(Views.Facet);
  });

}).call(this);
