(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var SearchResult, SearchResults, pubsub, _ref;
    pubsub = require('hilib/mixins/pubsub');
    SearchResult = require('models/searchresult');
    return SearchResults = (function(_super) {
      __extends(SearchResults, _super);

      function SearchResults() {
        _ref = SearchResults.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SearchResults.prototype.model = SearchResult;

      SearchResults.prototype.initialize = function() {
        _.extend(this, pubsub);
        this.currentQueryOptions = null;
        this.cachedModels = {};
        return this.on('add', this.setCurrent, this);
      };

      SearchResults.prototype.setCurrent = function(model) {
        this.current = model;
        return this.publish('change:results', model, this.currentQueryOptions);
      };

      SearchResults.prototype.runQuery = function(currentQueryOptions) {
        var options, resultRows, searchResult,
          _this = this;
        this.currentQueryOptions = currentQueryOptions;
        if (this.currentQueryOptions.hasOwnProperty('resultRows')) {
          resultRows = this.currentQueryOptions.resultRows;
          delete this.currentQueryOptions.resultRows;
        }
        options = {};
        if (resultRows != null) {
          options.resultRows = resultRows;
        }
        options.queryOptions = JSON.stringify(this.currentQueryOptions);
        if (this.cachedModels.hasOwnProperty(options.queryOptions)) {
          return this.setCurrent(this.cachedModels[options.queryOptions]);
        } else {
          this.trigger('request');
          searchResult = new SearchResult(null, options);
          return searchResult.fetch({
            success: function(model) {
              _this.cachedModels[options.queryOptions] = model;
              return _this.add(model);
            }
          });
        }
      };

      SearchResults.prototype.moveCursor = function(direction) {
        var searchResult, url,
          _this = this;
        if (url = this.current.get(direction)) {
          if (this.cachedModels.hasOwnProperty(url)) {
            return this.setCurrent(this.cachedModels[url]);
          } else {
            this.trigger('request');
            searchResult = new SearchResult();
            return searchResult.fetch({
              url: url,
              success: function(model, response, options) {
                _this.cachedModels[url] = model;
                return _this.add(model);
              }
            });
          }
        }
      };

      return SearchResults;

    })(Backbone.Collection);
  });

}).call(this);
