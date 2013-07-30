(function() {
  define(function(require) {
    var Views;
    Views = {
      Facets: {
        List: require('views/facets/list'),
        Boolean: require('views/facets/boolean'),
        Date: require('views/facets/date')
      }
    };
    return {
      search: true,
      baseUrl: '',
      searchUrl: '',
      token: null,
      queryOptions: {},
      facetViewMap: {
        BOOLEAN: Views.Facets.Boolean,
        LIST: Views.Facets.List,
        DATE: Views.Facets.Date
      }
    };
  });

}).call(this);
