(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(function(require) {
    var Models, ServerResponse, _ref;
    Models = {
      Base: require('models/base')
    };
    return ServerResponse = (function(_super) {
      __extends(ServerResponse, _super);

      function ServerResponse() {
        _ref = ServerResponse.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      ServerResponse.prototype.defaults = function() {
        return {
          _next: '',
          _prev: '',
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

      return ServerResponse;

    })(Models.Base);
  });

}).call(this);
