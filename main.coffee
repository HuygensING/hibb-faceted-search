define (require) ->

    Models = 
        Main: require 'modules/faceted-search/models/main'

    Views =
        Base: require 'views/base'
        List: require 'modules/faceted-search/views/facets/list'
        Search: require 'modules/faceted-search/views/search'

    Templates =
        FacetedSearch: require 'text!html/modules/faceted-search/faceted-search.html'

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


# require.config 
#     paths:
#         'jquery': '../lib/jquery/jquery'
#         'underscore': '../lib/underscore-amd/underscore'
#         'backbone': '../lib/backbone-amd/backbone'
#         'domready': '../lib/requirejs-domready/domReady'
#         'text': '../lib/requirejs-text/text'
#         'html': '../html'

#     shim:
#         'underscore':
#             exports: '_'
#         'backbone':
#             deps: ['underscore', 'jquery']
#             exports: 'Backbone'

# # require ['domready', 'app'], (domready, app) ->
# #     domready ->
# #         app.initialize()