(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, Fn, ListFacet, Models, Templates, Views, _ref;
    Fn = require('helpers/fns');
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
          }
        };
      };

      ListFacet.prototype.toggleBody = function(ev) {
        return $(ev.currentTarget).parents('.list').find('.body').slideToggle();
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
        var data, rtpl;
        ListFacet.__super__.render.apply(this, arguments);
        data = this.model.attributes;
        data = _.extend(data, {
          'generateID': function() {}
        });
        rtpl = _.template(Templates.List, data);
        this.$('.placeholder').html(rtpl);
        this.optionsView = new Views.Options({
          el: this.$('.items'),
          collection: this.collection
        });
        this.listenTo(this.optionsView, 'filter:finished', this.renderFilteredOptionCount);
        return this.listenTo(this.collection, 'change:checked', this.optionChecked);
      };

      ListFacet.prototype.optionChecked = function() {
        var checked;
        checked = [];
        this.optionsView.collection.each(function(model) {
          if (model.get('checked')) {
            return checked.push(model.id);
          }
        });
        return this.publish('facet:list:changed', {
          name: this.model.get('name'),
          values: checked
        });
      };

      ListFacet.prototype.renderFilteredOptionCount = function() {
        var collectionLength, filteredLength;
        filteredLength = this.optionsView.filtered_items.length;
        collectionLength = this.optionsView.collection.length;
        if (filteredLength === 0 || filteredLength === collectionLength) {
          this.$('header small').html('');
        } else {
          this.$('header small').html(filteredLength + ' of ' + collectionLength);
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
