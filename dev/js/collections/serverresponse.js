(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Collections, Models, ServerResponse, _ref;
    Models = {
      ServerResponse: require('models/serverresponse')
    };
    Collections = {
      Base: require('collections/base')
    };
    return ServerResponse = (function(_super) {
      __extends(ServerResponse, _super);

      function ServerResponse() {
        _ref = ServerResponse.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ServerResponse.prototype.model = Models.ServerResponse;

      return ServerResponse;

    })(Collections.Base);
  });

}).call(this);
