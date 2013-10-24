(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, FacetedSearch, Models, ajax, config, _ref;
    config = require('config');
    ajax = require('hilib/managers/ajax');
    Models = {
      Base: require('models/base')
    };
    Collections = {
      ServerResponse: require('collections/serverresponse')
    };
    return FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.defaults = function() {
        return {
          facetValues: []
        };
      };

      FacetedSearch.prototype.initialize = function(attrs, options) {
        var _this = this;
        this.attrs = attrs;
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.serverResponse = new Collections.ServerResponse();
        return this.on('change', function(model, options) {
          return _this.fetch({
            success: function(model, response, options) {
              return _this.trigger('results:change', response, _this.attributes);
            }
          });
        });
      };

      FacetedSearch.prototype.fetch = function(options) {
        var _this = this;
        if (options == null) {
          options = {};
        }
        options.error = function(model, response, options) {
          return console.log('fetching results failed', model, response, options);
        };
        return FacetedSearch.__super__.fetch.apply(this, arguments);
      };

      FacetedSearch.prototype.parse = function() {
        return {};
      };

      FacetedSearch.prototype.set = function(attrs, options) {
        var facetValues;
        if (attrs.hasOwnProperty('resultRows')) {
          this.resultRows = attrs.resultRows;
          delete attrs.resultRows;
        } else if (attrs === 'resultRows') {
          this.resultRows = options;
          return false;
        }
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

      FacetedSearch.prototype.setCursor = function(direction) {
        var jqXHR, url,
          _this = this;
        if (url = this.serverResponse.last().get('direction')) {
          jqXHR = ajax.get({
            url: url
          });
          jqXHR.done(function(data) {
            return _this.handleResponse(data);
          });
          return jqXHR.fail(function() {
            return console.error('setCursor failed');
          });
        }
      };

      FacetedSearch.prototype.sync = function(method, model, options) {
        var cachedID, cachedModel, jqXHR,
          _this = this;
        if (method === 'read') {
          cachedID = JSON.stringify(this.attributes);
          cachedModel = this.serverResponse.get(cachedID);
          if (cachedModel != null) {
            return options.success(cachedModel.attributes);
          } else {
            ajax.token = config.token;
            jqXHR = ajax.post({
              url: config.baseUrl + config.searchPath,
              data: JSON.stringify(this.attributes),
              dataType: 'text'
            });
            jqXHR.done(function(data, textStatus, jqXHR) {
              var url, xhr;
              if (jqXHR.status === 201) {
                url = jqXHR.getResponseHeader('Location');
                if (_this.resultRows != null) {
                  url += '?rows=' + _this.resultRows;
                }
                xhr = ajax.get({
                  url: url
                });
                return xhr.done(function(data, textStatus, jqXHR) {
                  data.id = JSON.stringify(_this.attributes);
                  _this.serverResponse.add(data);
                  return options.success(data);
                });
              }
            });
            return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
              if (jqXHR.status === 401) {
                return _this.publish('unauthorized');
              }
            });
          }
        }
      };

      FacetedSearch.prototype.reset = function() {
        this.clear({
          silent: true
        });
        this.set(this.defaults(), {
          silent: true
        });
        this.set(this.attrs, {
          silent: true
        });
        return this.fetch();
      };

      return FacetedSearch;

    })(Models.Base);
  });

}).call(this);
