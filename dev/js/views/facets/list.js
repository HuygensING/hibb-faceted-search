(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, ListFacet, Models, Templates, Views, _ref;
    Models = {
      List: require('models/list')
    };
    Collections = {
      Options: require('collections/list.options')
    };
    Views = {
      Facet: require('views/facet'),
      Options: require('views/facets/list.options')
    };
    Templates = {
      List: require('text!html/facet/list.html')
    };
    return ListFacet = (function(_super) {
      __extends(ListFacet, _super);

      function ListFacet() {
        _ref = ListFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListFacet.prototype.checked = [];

      ListFacet.prototype.filtered_items = [];

      ListFacet.prototype.className = 'facet list';

      ListFacet.prototype.events = function() {
        return {
          'click li.all': 'selectAll',
          'click li.none': 'deselectAll',
          'click h3': 'toggleBody',
          'keyup input.listsearch': function(ev) {
            return this.optionsView.filterOptions(ev.currentTarget.value);
          },
          'click header small': 'toggleOptions'
        };
      };

      ListFacet.prototype.toggleOptions = function(ev) {
        this.$('header .options').slideToggle();
        return this.$('.options .listsearch').focus();
      };

      ListFacet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.facet').find('.body').slideToggle();
      };

      ListFacet.prototype.selectAll = function() {
        var cb, checkboxes, _i, _len, _results;
        checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        _results = [];
        for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
          cb = checkboxes[_i];
          _results.push(cb.checked = true);
        }
        return _results;
      };

      ListFacet.prototype.deselectAll = function() {
        var cb, checkboxes, _i, _len, _results;
        checkboxes = this.el.querySelectorAll('input[type="checkbox"]');
        _results = [];
        for (_i = 0, _len = checkboxes.length; _i < _len; _i++) {
          cb = checkboxes[_i];
          _results.push(cb.checked = false);
        }
        return _results;
      };

      ListFacet.prototype.initialize = function(options) {
        ListFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.List(options.attrs);
        this.collection = new Collections.Options(options.attrs.options, {
          parse: true
        });
        return this.render();
      };

      ListFacet.prototype.render = function() {
        var rtpl,
          _this = this;
        ListFacet.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.List, this.model.attributes);
        this.$('.placeholder').html(rtpl);
        this.optionsView = new Views.Options({
          el: this.$('.body .options'),
          collection: this.collection,
          facetName: this.model.get('name')
        });
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
          this.$('header .options .listsearch').addClass('nonefound');
          this.$('header small.optioncount').html('');
        } else {
          this.$('header .options .listsearch').removeClass('nonefound');
          this.$('header small.optioncount').html(filteredLength + ' of ' + collectionLength);
        }
        return this;
      };

      ListFacet.prototype.update = function(newOptions) {
        return this.optionsView.collection.updateOptions(newOptions);
      };

      return ListFacet;

    })(Views.Facet);
  });

}).call(this);
