(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Fn, ListFacetOptions, Models, tpls;
    Fn = require('hilib/functions/general');
    Models = {
      List: require('models/list')
    };
    tpls = require('tpls');
    return ListFacetOptions = (function(_super) {
      __extends(ListFacetOptions, _super);

      function ListFacetOptions() {
        this.triggerChange = __bind(this.triggerChange, this);
        return ListFacetOptions.__super__.constructor.apply(this, arguments);
      }

      ListFacetOptions.prototype.className = 'container';

      ListFacetOptions.prototype.initialize = function() {
        this.showing = null;
        this.showingIncrement = 50;
        this.filtered_items = this.collection.models;
        this.listenTo(this.collection, 'sort', (function(_this) {
          return function() {
            _this.filtered_items = _this.collection.models;
            return _this.render();
          };
        })(this));
        return this.render();
      };

      ListFacetOptions.prototype.render = function() {
        var ul;
        this.showing = 50;
        ul = document.createElement('ul');
        ul.style.height = (this.filtered_items.length * 15) + 'px';
        this.el.innerHTML = '';
        this.el.appendChild(ul);
        this.appendOptions();
        return this;
      };

      ListFacetOptions.prototype.renderAll = function() {
        this.render();
        return this.appendAllOptions();
      };

      ListFacetOptions.prototype.appendOptions = function() {
        var option, tpl, _i, _len, _ref;
        tpl = '';
        _ref = this.filtered_items.slice(this.showing - this.showingIncrement, +this.showing + 1 || 9e9);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          tpl += tpls['faceted-search/facets/list.option']({
            option: option
          });
        }
        return this.$('ul').append(tpl);
      };

      ListFacetOptions.prototype.appendAllOptions = function() {
        var option, tpl, _i, _len, _ref;
        tpl = '';
        _ref = this.filtered_items.slice(this.showing);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          option = _ref[_i];
          tpl += tpls['faceted-search/facets/list.option']({
            option: option
          });
        }
        return this.$('ul').append(tpl);
      };

      ListFacetOptions.prototype.events = function() {
        return {
          'click i': 'checkChanged',
          'click label': 'checkChanged',
          'scroll': 'onScroll'
        };
      };

      ListFacetOptions.prototype.onScroll = function(ev) {
        var target, topPerc;
        target = ev.currentTarget;
        topPerc = target.scrollTop / target.scrollHeight;
        if (topPerc > (this.showing / 2) / this.collection.length && this.showing < this.collection.length) {
          this.showing += this.showingIncrement;
          if (this.showing > this.collection.length) {
            this.showing = this.collection.length;
          }
          return this.appendOptions();
        }
      };

      ListFacetOptions.prototype.checkChanged = function(ev) {
        var $target, id;
        $target = ev.currentTarget.tagName === 'LABEL' ? this.$('i[data-value="' + ev.currentTarget.getAttribute('data-value') + '"]') : $(ev.currentTarget);
        $target.toggleClass('fa-square-o');
        $target.toggleClass('fa-check-square-o');
        id = $target.attr('data-value');
        this.collection.get(id).set('checked', $target.hasClass('fa-check-square-o'));
        if (this.$('i.fa-check-square-o').length === 0) {
          return this.triggerChange();
        } else {
          return Fn.timeoutWithReset(1000, (function(_this) {
            return function() {
              return _this.triggerChange();
            };
          })(this));
        }
      };

      ListFacetOptions.prototype.triggerChange = function() {
        return this.trigger('change', {
          facetValue: {
            name: this.options.facetName,
            values: _.map(this.$('i.fa-check-square-o'), function(cb) {
              return cb.getAttribute('data-value');
            })
          }
        });
      };


      /*
      		Called by parent (ListFacet) when user types in the search input
       */

      ListFacetOptions.prototype.filterOptions = function(value) {
        var re;
        re = new RegExp(value, 'i');
        this.filtered_items = this.collection.filter(function(item) {
          return re.test(item.id);
        });
        if (this.filtered_items.length === 0) {
          this.filtered_items = this.collection.models;
        }
        this.trigger('filter:finished');
        return this.render();
      };

      ListFacetOptions.prototype.setCheckboxes = function(ev) {
        var model, _i, _len, _ref;
        _ref = this.collection.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          model.set('checked', ev.currentTarget.checked);
        }
        this.render();
        return this.triggerChange();
      };

      return ListFacetOptions;

    })(Backbone.View);
  });

}).call(this);
