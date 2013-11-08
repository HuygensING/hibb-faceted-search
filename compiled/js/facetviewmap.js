(function() {
  define(function(require) {
    return {
      BOOLEAN: require('views/facets/boolean'),
      DATE: require('views/facets/date'),
      LIST: require('views/facets/list')
    };
  });

}).call(this);
