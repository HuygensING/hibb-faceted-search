(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var SearchResult, SearchResults, ajax, config, pubsub, token, _ref;
    pubsub = require('hilib/mixins/pubsub');
    SearchResult = require('models/searchresult');
    ajax = require('hilib/managers/ajax');
    token = require('hilib/managers/token');
    config = require('config');
    return SearchResults = (function(_super) {
      __extends(SearchResults, _super);

      function SearchResults() {
        _ref = SearchResults.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      SearchResults.prototype.model = SearchResult;

      SearchResults.prototype.initialize = function() {
        _.extend(this, pubsub);
        this.cachedModels = {};
        return this.on('add', this.setCurrent, this);
      };

      SearchResults.prototype.setCurrent = function(current) {
        var message;
        this.current = current;
        message = this.current.options.url != null ? 'change:cursor' : 'change:results';
        return this.publish(message, this.current);
      };

      SearchResults.prototype.runQuery = function(queryOptions) {
        var cacheString, options, resultRows, searchResult,
          _this = this;
        if (queryOptions.hasOwnProperty('resultRows')) {
          resultRows = queryOptions.resultRows;
          delete queryOptions.resultRows;
        }
        cacheString = JSON.stringify(queryOptions);
        if (this.cachedModels.hasOwnProperty(cacheString)) {
          return this.setCurrent(this.cachedModels[cacheString]);
        } else {
          this.trigger('request');
          options = {};
          options.cacheString = cacheString;
          options.queryOptions = queryOptions;
          if (resultRows != null) {
            options.resultRows = resultRows;
          }
          searchResult = new SearchResult(null, options);
          return searchResult.fetch({
            success: function(model) {
              _this.cachedModels[cacheString] = model;
              return _this.add(model);
            }
          });
        }
      };

      SearchResults.prototype.moveCursor = function(direction) {
        var searchResult, url,
          _this = this;
        url = direction === '_prev' || direction === '_next' ? this.current.get(direction) : direction;
        if (url != null) {
          if (this.cachedModels.hasOwnProperty(url)) {
            return this.setCurrent(this.cachedModels[url]);
          } else {
            searchResult = new SearchResult(null, {
              url: url
            });
            return searchResult.fetch({
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
