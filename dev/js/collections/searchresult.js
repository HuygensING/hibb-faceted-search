(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var ServerResponse, ServerResponses, pubsub, _ref;
    pubsub = require('hilib/mixins/pubsub');
    ServerResponse = require('models/serverresponse');
    return ServerResponses = (function(_super) {
      __extends(ServerResponses, _super);

      function ServerResponses() {
        _ref = ServerResponses.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ServerResponses.prototype.model = ServerResponse;

      ServerResponses.prototype.initialize = function() {
        _.extend(this, pubsub);
        this.currentQueryOptions = null;
        this.cachedModels = {};
        return this.on('add', this.setCurrent, this);
      };

      ServerResponses.prototype.setCurrent = function(model) {
        this.current = model;
        return this.publish('change:results', model, this.currentQueryOptions);
      };

      ServerResponses.prototype.runQuery = function(currentQueryOptions) {
        var data, resultRows, serverResponse,
          _this = this;
        this.currentQueryOptions = currentQueryOptions;
        if (this.currentQueryOptions.hasOwnProperty('resultRows')) {
          resultRows = this.currentQueryOptions.resultRows;
          delete this.currentQueryOptions.resultRows;
        }
        data = JSON.stringify(this.currentQueryOptions);
        if (this.cachedModels.hasOwnProperty(data)) {
          return this.setCurrent(this.cachedModels[data]);
        } else {
          serverResponse = new ServerResponse();
          if (resultRows != null) {
            serverResponse.resultRows = resultRows;
          }
          return serverResponse.fetch({
            data: data,
            success: function(model, response, options) {
              _this.cachedModels[data] = model;
              return _this.add(model);
            }
          });
        }
      };

      ServerResponses.prototype.moveCursor = function(direction) {
        var serverResponse, url,
          _this = this;
        if (url = this.current.get(direction)) {
          if (this.cachedModels.hasOwnProperty(url)) {
            return this.setCurrent(this.cachedModels[url]);
          } else {
            serverResponse = new ServerResponse();
            return serverResponse.fetch({
              url: url,
              success: function(model, response, options) {
                _this.cachedModels[url] = model;
                return _this.add(model);
              }
            });
          }
        }
      };

      return ServerResponses;

    })(Backbone.Collection);
  });

}).call(this);
