# require.config 
#     paths:
#         'backbone': '../lib/backbone-amd/backbone-min'
#         'domready': '../lib/requirejs-domready/domReady'
#         'jquery': '../lib/jquery/jquery.min'
#         'text': '../lib/requirejs-text/text'
#         'underscore': '../lib/underscore-amd/underscore-min'
#         # 'ajax': '../lib/managers/dev/ajax'
#         'managers': '../lib/managers/dev'
#         'helpers': '../lib/helpers/dev'
#         'html': '../html'

# require ['views/main'], (fs) ->
#     console.log require 'jquery'
#     console.log fs
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
            @model.set 'baseUrl', @options.baseUrl
            @model.set 'searchUrl', @options.searchUrl
            @model.set 'token', @options.token

            @subscribe 'faceted-search:results', (results) =>
                # TMP: cuz of a bug in r.js Backbone must be build with the faceted-search
                # But that means a project and the faceted-search are using two different instances of Backbone
                # and thus publish/subscribe will not work
                @trigger 'faceted-search:results', results 

            @render()

        render: ->
            rtpl = _.template Templates.FacetedSearch
            @$el.html rtpl

            if @options.search
                search = new Views.Search()
                @$('form').html search.$el

            # TODO: Show message to user when render fails
            @model.query {}, (data) =>
                @publish 'faceted-search:results', data
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