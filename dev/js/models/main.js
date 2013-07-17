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
          token: ''
        };
      };

      FacetedSearch.prototype.queryOptions = function() {
        return {
          term: '*',
          sort: 'score',
          fuzzy: false,
          facetValues: [],
          caseSensitive: false
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

      FacetedSearch.prototype.initialize = function() {
        var _this = this;
        FacetedSearch.__super__.initialize.apply(this, arguments);
        this.set('queryOptions', _.extend(this.queryOptions(), this.get('queryOptions')));
        this.on('change:queryOptions', this.fetch, this);
        return this.subscribe('facet:list:changed', function(data) {
          if (data.values.length) {
            _this.facetValues[data.name] = data;
          } else {
            delete _this.facetValues[data.name];
          }
          return _this.setQueryOption('facetValues', _.values(_this.facetValues));
        });
      };

      FacetedSearch.prototype.fetch = function() {
        var fetchResults, jqXHR,
          _this = this;
        ajax.token = this.get('token');
        fetchResults = function(url) {
          var jqXHR;
          jqXHR = ajax.get({
            url: url
          });
          return jqXHR.done(function(data) {
            return _this.publish('faceted-search:results', data);
          });
        };
        jqXHR = ajax.post({
          url: this.get('baseUrl') + this.get('searchUrl'),
          data: JSON.stringify(this.get('queryOptions')),
          dataType: 'text'
        });
        jqXHR.done(function(data, textStatus, jqXHR) {
          if (jqXHR.status === 201) {
            return fetchResults(jqXHR.getResponseHeader('Location'));
          }
        });
        return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
          if (jqXHR.status === 401) {
            return _this.publish('unauthorized');
          }
        });
      };

      return FacetedSearch;

    })(Models.Base);
  });

}).call(this);
