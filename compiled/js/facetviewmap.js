(function() {
  define(function(require) {
    return {
      BOOLEAN: require('views/facets/boolean'),
      DATE: require('views/facets/date'),
      RANGE: require('views/facets/range'),
      LIST: require('views/facets/list')
    };
  });

}).call(this);
