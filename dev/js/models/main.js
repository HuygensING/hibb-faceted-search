(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, ajax, config, _ref;
    config = require('config');
    ajax = require('managers/ajax');
    Models = {
      Base: require('models/base')
    };
    return FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.serverResponse = {};

      FacetedSearch.prototype.defaults = function() {
        return {
          facetValues: []
        };
      };

      FacetedSearch.prototype.parse = function(attrs) {
        this.serverResponse = attrs;
        return {};
      };

      FacetedSearch.prototype.set = function(attrs, options) {
        var facetValues;
        if (attrs.facetValue != null) {
          facetValues = _.reject(this.get('facetValues'), function(data) {
            return data.name === attrs.facetValue.name;
          });
          if (attrs.facetValue.values.length) {
            facetValues.push(attrs.facetValue);
          }
          attrs.facetValues = facetValues;
          delete attrs.facetValue;
        }
        return FacetedSearch.__super__.set.call(this, attrs, options);
      };

      FacetedSearch.prototype.sync = function(method, model, options) {
        var jqXHR,
          _this = this;
        if (method === 'read') {
          ajax.token = config.token;
          jqXHR = ajax.post({
            url: config.baseUrl + config.searchUrl,
            data: JSON.stringify(this.attributes),
            dataType: 'text'
          });
          jqXHR.done(function(data, textStatus, jqXHR) {
            var xhr;
            if (jqXHR.status === 201) {
              xhr = ajax.get({
                url: jqXHR.getResponseHeader('Location')
              });
              return xhr.done(options.success);
            }
          });
          return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
              return _this.publish('unauthorized');
            }
          });
        }
      };

      FacetedSearch.prototype.setCursor = function(direction, cb, context) {
        var jqXHR,
          _this = this;
        if (this.serverResponse[direction]) {
          jqXHR = ajax.get({
            url: this.serverResponse[direction]
          });
          return jqXHR.done(function(response) {
            _this.serverResponse = response;
            return cb.call(context, response);
          });
        }
      };

      return FacetedSearch;

    })(Models.Base);
  });

}).call(this);
