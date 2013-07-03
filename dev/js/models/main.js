(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var FacetedSearch, Models, ajax, _ref;
    ajax = require('managers/ajax');
    Models = {
      Base: require('models/base')
    };
    FacetedSearch = (function(_super) {
      __extends(FacetedSearch, _super);

      function FacetedSearch() {
        _ref = FacetedSearch.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      FacetedSearch.prototype.defaults = function() {
        return {
          url: ''
        };
      };

      FacetedSearch.prototype.query = function(queryData, cb) {
        var fetchResults, jqXHR,
          _this = this;
        fetchResults = function(key) {
          var jqXHR;
          jqXHR = ajax.get({
            url: _this.get('url') + '/' + key
          });
          return jqXHR.done(cb);
        };
        jqXHR = ajax.post({
          url: this.get('url'),
          contentType: 'application/json; charset=utf-8',
          processData: false,
          data: JSON.stringify(queryData)
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

      return FacetedSearch;

    })(Models.Base);
    return new FacetedSearch();
  });

}).call(this);
