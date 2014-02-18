(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, RangeFacet, Views, handleSize, tpls;
    Models = {
      Range: require('models/range')
    };
    Views = {
      Facet: require('views/facets/main')
    };
    tpls = require('tpls');
    handleSize = 12;
    return RangeFacet = (function(_super) {
      __extends(RangeFacet, _super);

      function RangeFacet() {
        return RangeFacet.__super__.constructor.apply(this, arguments);
      }

      RangeFacet.prototype.className = 'facet range';

      RangeFacet.prototype.initialize = function(options) {
        RangeFacet.__super__.initialize.apply(this, arguments);
        this.draggingMin = false;
        this.dragginMax = false;
        this.model = new Models.Range(options.attrs, {
          parse: true
        });
        this.listenTo(this.model, 'change:options', this.render);
        return this.render();
      };

      RangeFacet.prototype.render = function() {
        var rtpl;
        RangeFacet.__super__.render.apply(this, arguments);
        rtpl = tpls['faceted-search/facets/range.body'](this.model.attributes);
        this.$('.body').html(rtpl);
        this.$('header i.openclose').hide();
        setTimeout(((function(_this) {
          return function() {
            return _this.postRender();
          };
        })(this)), 0);
        this.$el.mouseleave((function(_this) {
          return function() {
            return _this.stopDragging();
          };
        })(this));
        return this;
      };

      RangeFacet.prototype.postRender = function() {
        var $slider;
        this.$minHandle = this.$('.min-handle');
        this.$maxHandle = this.$('.max-handle');
        this.$minValue = this.$('.min-value');
        this.$maxValue = this.$('.max-value');
        this.$bar = this.$('.bar');
        $slider = this.$('.slider');
        this.sliderWidth = $slider.width();
        this.sliderLeft = $slider.offset().left;
        this.minHandleLeft = handleSize / -2;
        this.maxHandleLeft = this.sliderWidth - (handleSize / 2);
        return this.$maxHandle.css('left', this.maxHandleLeft);
      };

      RangeFacet.prototype.events = function() {
        return {
          'mousedown .max-handle': function() {
            return this.draggingMax = true;
          },
          'mousedown .min-handle': function() {
            return this.draggingMin = true;
          },
          'mouseup': 'stopDragging',
          'mousemove': 'drag',
          'click .slider': 'moveHandle',
          'click button': 'doSearch'
        };
      };

      RangeFacet.prototype.doSearch = function(ev) {
        ev.preventDefault();
        return this.trigger('change', {
          facetValue: {
            name: this.model.get('name'),
            lowerLimit: +(this.$minValue.html() + '0101'),
            upperLimit: +(this.$maxValue.html() + '1231')
          }
        });
      };

      RangeFacet.prototype.moveHandle = function(ev) {
        var left;
        if (!(ev.target === this.el.querySelector('.slider') || ev.target === this.el.querySelector('.bar'))) {
          return;
        }
        left = ev.clientX - this.sliderLeft;
        if (Math.abs(this.$minHandle.position().left - left) < Math.abs(this.$maxHandle.position().left - left)) {
          this.$minHandle.css('left', left - (handleSize / 2));
          this.$bar.css('left', left);
          return this.updateValue(this.$minValue, left);
        } else {
          this.$maxHandle.css('left', left - (handleSize / 2));
          this.$bar.css('right', this.sliderWidth - left);
          return this.updateValue(this.$maxValue, left);
        }
      };

      RangeFacet.prototype.stopDragging = function() {
        this.draggingMin = false;
        return this.draggingMax = false;
      };

      RangeFacet.prototype.drag = function(ev) {
        var left;
        if (this.draggingMin) {
          left = ev.clientX - this.sliderLeft;
          this.minHandleLeft = left - (handleSize / 2);
          if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
            this.$minHandle.css('left', this.minHandleLeft);
            this.$bar.css('left', left);
            this.updateValue(this.$minValue, left);
          }
        }
        if (this.draggingMax) {
          left = ev.clientX - this.sliderLeft;
          this.maxHandleLeft = left - (handleSize / 2);
          if ((-1 < left && left <= this.sliderWidth) && this.maxHandleLeft > this.minHandleLeft) {
            this.$maxHandle.css('left', this.maxHandleLeft);
            this.$bar.css('right', this.sliderWidth - left);
            return this.updateValue(this.$maxValue, left);
          }
        }
      };

      RangeFacet.prototype.updateValue = function($el, left) {
        var ll, ul, value;
        this.$('button').show();
        ll = this.model.get('options').lowerLimit;
        ul = this.model.get('options').upperLimit;
        value = Math.floor((left / this.sliderWidth * (ul - ll)) + ll);
        return $el.html(value);
      };

      RangeFacet.prototype.getLeftPosFromYear = function(year) {
        var left, ll, ul;
        ll = this.model.get('options').lowerLimit;
        ul = this.model.get('options').upperLimit;
        left = ((year - ll) / (ul - ll)) * this.sliderWidth;
        return Math.floor(left);
      };

      RangeFacet.prototype.setMinValue = function(year) {
        var left;
        left = this.getLeftPosFromYear(year);
        this.$minHandle.css('left', left);
        this.$minValue.html(year);
        return this.$bar.css('left', left);
      };

      RangeFacet.prototype.setMaxValue = function(year) {
        var left;
        left = this.getLeftPosFromYear(year);
        this.$maxHandle.css('left', left);
        this.$maxValue.html(year);
        return this.$bar.css('right', this.sliderWidth - left);
      };

      RangeFacet.prototype.update = function(newOptions) {
        if (_.isArray(newOptions)) {
          newOptions = newOptions[0];
        }
        this.setMinValue(+(newOptions.lowerLimit + '').substr(0, 4));
        this.setMaxValue(+(newOptions.upperLimit + '').substr(0, 4));
        return this.$('button').hide();
      };

      RangeFacet.prototype.reset = function() {};

      return RangeFacet;

    })(Views.Facet);
  });

}).call(this);
