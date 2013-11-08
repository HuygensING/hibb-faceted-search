(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, SearchResult, ajax, config, token, _ref;
    ajax = require('hilib/managers/ajax');
    token = require('hilib/managers/token');
    config = require('config');
    Models = {
      Base: require('models/base')
    };
    return SearchResult = (function(_super) {
      __extends(SearchResult, _super);

      function SearchResult() {
        _ref = SearchResult.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SearchResult.prototype.defaults = function() {
        return {
          _next: null,
          _prev: null,
          ids: [],
          numFound: null,
          results: [],
          rows: null,
          solrquery: '',
          sortableFields: [],
          start: null,
          term: ''
        };
      };

      SearchResult.prototype.sync = function(method, model, options) {
        var jqXHR,
          _this = this;
        if (method === 'read') {
          if (options.url != null) {
            return this.getResults(options.url, options.success);
          } else {
            ajax.token = config.token;
            jqXHR = ajax.post({
              url: config.baseUrl + config.searchPath,
              data: options.data,
              dataType: 'text'
            });
            jqXHR.done(function(data, textStatus, jqXHR) {
              var url;
              if (jqXHR.status === 201) {
                url = jqXHR.getResponseHeader('Location');
                if (_this.resultRows != null) {
                  url += '?rows=' + _this.resultRows;
                }
                return _this.getResults(url, options.success);
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

      SearchResult.prototype.getResults = function(url, done) {
        var jqXHR,
          _this = this;
        ajax.token = config.token;
        jqXHR = ajax.get({
          url: url
        });
        jqXHR.done(function(data, textStatus, jqXHR) {
          return done(data);
        });
        return jqXHR.fail(function() {
          return console.error('Failed getting FacetedSearch results from the server!');
        });
      };

      return SearchResult;

    })(Models.Base);
  });

}).call(this);
