(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, Fn, ListFacet, Models, Templates, Views, _ref;
    Fn = require('helpers/fns');
    Views = {
      Facet: require('views/facet')
    };
    Models = {
      List: require('models/list')
    };
    Collections = {
      Facets: require('collections/facets')
    };
    Templates = {
      List: require('text!html/facet/list.html'),
      Items: require('text!html/facet/list.items.html')
    };
    return ListFacet = (function(_super) {
      __extends(ListFacet, _super);

      function ListFacet() {
        _ref = ListFacet.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListFacet.prototype.filtered_items = [];

      ListFacet.prototype.className = 'facet list';

      ListFacet.prototype.events = function() {
        return {
          'click li.all': 'selectAll',
          'click li.none': 'deselectAll',
          'click h3': 'toggleBody',
          'keyup input.listsearch': 'showResults'
        };
      };

      ListFacet.prototype.toggleBody = function(ev) {
        console.log($(ev.currentTarget).parents('.list'));
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

      ListFacet.prototype.showResults = function(ev) {
        var re, value;
        value = ev.currentTarget.value;
        re = new RegExp(value, 'i');
        this.filtered_items = this.model.get('options').filter(function(item) {
          return re.test(item.get('name'));
        });
        return this.renderListItems();
      };

      ListFacet.prototype.initialize = function(options) {
        ListFacet.__super__.initialize.apply(this, arguments);
        this.model = new Models.List(options.attrs, {
          parse: true
        });
        return this.render();
      };

      ListFacet.prototype.render = function() {
        var rtpl;
        ListFacet.__super__.render.apply(this, arguments);
        rtpl = _.template(Templates.List, this.model.attributes);
        this.$('.placeholder').html(rtpl);
        this.renderListItems();
        return this;
      };

      ListFacet.prototype.renderListItems = function() {
        var items, rtpl;
        items = this.filtered_items.length > 0 ? this.filtered_items : this.model.get('options').models;
        rtpl = _.template(Templates.Items, {
          model: this.model.attributes,
          items: items,
          generateID: Fn.generateID
        });
        return this.$('.body ul.items').html(rtpl);
      };

      return ListFacet;

    })(Views.Facet);
  });

}).call(this);
