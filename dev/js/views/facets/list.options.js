(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Fn, ListOptions, Models, Templates, Views, _ref;
    Fn = require('helpers/general');
    Views = {
      Base: require('views/base')
    };
    Models = {
      List: require('models/list')
    };
    Templates = {
      List: require('text!html/facet/list.html'),
      Options: require('text!html/facet/list.options.html')
    };
    return ListOptions = (function(_super) {
      __extends(ListOptions, _super);

      function ListOptions() {
        _ref = ListOptions.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ListOptions.prototype.filtered_items = [];

      ListOptions.prototype.events = function() {
        return {
          'change input[type="checkbox"]': 'checkChanged'
        };
      };

      ListOptions.prototype.checkChanged = function(ev) {
        var id;
        id = ev.currentTarget.getAttribute('data-value');
        this.collection.get(id).set('checked', ev.currentTarget.checked);
        return this.trigger('change', {
          facetValue: {
            name: this.options.facetName,
            values: _.map(this.$('input:checked'), function(input) {
              return input.getAttribute('data-value');
            })
          }
        });
      };

      ListOptions.prototype.initialize = function() {
        ListOptions.__super__.initialize.apply(this, arguments);
        this.listenTo(this.collection, 'sort', this.render);
        return this.render();
      };

      ListOptions.prototype.render = function() {
        var options, rtpl;
        options = this.filtered_items.length > 0 ? this.filtered_items : this.collection.models;
        rtpl = _.template(Templates.Options, {
          options: options,
          generateID: Fn.generateID
        });
        return this.$el.html(rtpl);
      };

      /*
      		Called by parent (ListFacet) when user types in the search input
      */


      ListOptions.prototype.filterOptions = function(value) {
        var re;
        re = new RegExp(value, 'i');
        this.filtered_items = this.collection.filter(function(item) {
          return re.test(item.id);
        });
        this.trigger('filter:finished');
        return this.render();
      };

      return ListOptions;

    })(Views.Base);
  });

}).call(this);
