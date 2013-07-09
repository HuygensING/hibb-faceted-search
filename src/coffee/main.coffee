define (require) ->

    Models = 
        query: require 'models/query'

    Views =
        Base: require 'views/base'
        List: require 'views/facets/list'
        Search: require 'views/search'

    Templates =
        FacetedSearch: require 'text!html/faceted-search.html'

    class FacetedSearch extends Views.Base

        className: 'faceted-search'

        defaultOptions: ->
            search: true

        initialize: (options) ->
            super

            @options = _.extend @defaultOptions(), options

            
            Models.query.baseUrl = @options.baseUrl
            Models.query.searchUrl = @options.searchUrl
            Models.query.token = @options.token

            # TMP: cuz of a bug in r.js Backbone must be build with the faceted-search
            # But that means a project and the faceted-search are using two different instances of Backbone
            # and thus publish/subscribe will not work
            @subscribe 'faceted-search:results', (results) =>
                @renderFacets results
                @trigger 'faceted-search:results', results 

            @subscribe 'facet:list:changed', (data) =>
                Models.query.addFacetValues data
                # Models.query.get('data').facetValues.push data
                # console.log Models.query.get('data').facetValues


            @render()

        render: ->
            rtpl = _.template Templates.FacetedSearch
            @$el.html rtpl

            if @options.search
                search = new Views.Search()
                @$('.search-placeholder').html search.$el

            # TODO: Show message to user when render fails
            Models.query.fetch()
                # @facets = data.facets
                # @renderFacets()

            @

        # fetchFacets: ->

        renderFacets: (data) ->
            # console.log data
            @$('.facets').html ''

            # TODO: Add Views.List to Collections.Facets
            # TODO: Add Views.Boolean
            for own index, data of data.facets
                list = new Views.List attrs: data
                @$('.facets').append list.$el