(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Ajax, Fn, Models, Query, _ref;
    Ajax = require('managers/ajax');
    Fn = require('helpers/fns');
    Models = {
      Base: require('models/base'),
      options: require('models/options')
    };
    Query = (function(_super) {
      __extends(Query, _super);

      function Query() {
        _ref = Query.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      Query.prototype.baseUrl = '';

      Query.prototype.searchUrl = '';

      Query.prototype.token = '';

      Query.prototype.facetValues = {};

      Query.prototype.defaults = function() {
        return Models.options.get('defaultQuery');
      };

      Query.prototype.initialize = function() {
        var _this = this;
        Query.__super__.initialize.apply(this, arguments);
        this.on('change:facetValues', this.fetch, this);
        return this.subscribe('facet:list:changed', function(data) {
          if (data.values.length) {
            _this.facetValues[data.name] = data;
          } else {
            delete _this.facetValues[data.name];
          }
          return _this.set('facetValues', _.values(_this.facetValues));
        });
      };

      Query.prototype.getQueryData = function() {
        var data;
        data = this.get('facetValues').length ? this.attributes : this.defaults();
        return JSON.stringify(data);
      };

      Query.prototype.fetch = function() {
        var ajax, fetchResults, jqXHR,
          _this = this;
        ajax = new Ajax({
          baseUrl: this.baseUrl,
          token: this.token
        });
        fetchResults = function(key) {
          var jqXHR;
          jqXHR = ajax.get({
            url: _this.searchUrl + '/' + key
          });
          return jqXHR.done(function(data) {
            return _this.publish('faceted-search:results', data);
          });
        };
        jqXHR = ajax.post({
          url: this.searchUrl,
          contentType: 'application/json; charset=utf-8',
          processData: false,
          data: this.getQueryData()
        });
        jqXHR.done(function(data) {
          return fetchResults(data.key);
        });
        return jqXHR.fail(function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 401) {
            return _this.publish('unauthorized');
          }
        });
      };

      return Query;

    })(Models.Base);
    return new Query();
  });

}).call(this);
