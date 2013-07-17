(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, ajax, _ref;
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

      FacetedSearch.prototype.facetValues = {};

      FacetedSearch.prototype.defaults = function() {
        return {
          search: true,
          baseUrl: '',
          searchUrl: '',
          token: null
        };
      };

      FacetedSearch.prototype.queryOptions = function() {
        return {
          term: '*',
          facetValues: []
        };
      };

      FacetedSearch.prototype.getQueryOption = function(attr) {
        return this.get('queryOptions')[attr];
      };

      FacetedSearch.prototype.setQueryOption = function(attr, value) {
        var qo;
        qo = this.get('queryOptions');
        qo[attr] = value;
        this.set('queryOptions', qo);
        return this.trigger('change:queryOptions');
      };

      FacetedSearch.prototype.setQueryOptions = function(options) {
        var attr, facetValues, value, _results;
        if (options.facetValue != null) {
          facetValues = _.reject(this.getQueryOption('facetValues'), function(data) {
            return data.name === options.facetValue.name;
          });
          if (options.facetValue.values.length) {
            facetValues.push(options.facetValue);
          }
          options.facetValues = facetValues;
          delete options.facetValue;
        }
        _results = [];
        for (attr in options) {
          if (!__hasProp.call(options, attr)) continue;
          value = options[attr];
          _results.push(this.setQueryOption(attr, value));
        }
        return _results;
      };

      FacetedSearch.prototype.initialize = function() {
        FacetedSearch.__super__.initialize.apply(this, arguments);
        return this.set('queryOptions', _.extend(this.queryOptions(), this.get('queryOptions')));
      };

      FacetedSearch.prototype.sync = function(method, model, options) {
        var jqXHR,
          _this = this;
        if (method === 'read') {
          ajax.token = this.get('token');
          jqXHR = ajax.post({
            url: this.get('baseUrl') + this.get('searchUrl'),
            data: JSON.stringify(this.get('queryOptions')),
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
            console.log(jqXHR);
            if (jqXHR.status === 401) {
              return _this.publish('unauthorized');
            }
          });
        }
      };

      return FacetedSearch;

    })(Models.Base);
  });

}).call(this);
