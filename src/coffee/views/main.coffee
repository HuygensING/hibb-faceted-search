define (require) ->

    Models = 
        Main: require 'models/main'

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

            @model = Models.Main
            @model.set 'url', @options.url

            @render()

        render: ->
            rtpl = _.template Templates.FacetedSearch
            @$el.html rtpl

            if @options.search
                search = new Views.Search()
                @$('form').html search.$el

            # TODO: Show message to user when render fails
            @model.query {}, (data) =>
                @facets = data.facets
                @renderFacets()

            @

        # fetchFacets: ->

        renderFacets: ->
            # TODO: Add Views.List to Collections.Facets
            # TODO: Add Views.Boolean
            for own index, data of @facets
                list = new Views.List attrs: data
                @$('form').append list.$el