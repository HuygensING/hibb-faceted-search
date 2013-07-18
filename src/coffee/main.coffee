define (require) ->

	config = require 'config'

	Models = 
		FacetedSearch: require 'models/main'
		RestClient: require 'models/restclient'

	Views =
		Base: require 'views/base'
		Search: require 'views/search'
		List: require 'views/facets/list'
		Boolean: require 'views/facets/boolean'

	Templates =
			FacetedSearch: require 'text!html/faceted-search.html'

	class FacetedSearch extends Views.Base
		initialize: (options) ->
			super # ANTIPATTERN

			_.extend config, options

			@model = new Models.FacetedSearch config.queryOptions

			@subscribe 'unauthorized', => @trigger 'unauthorized'

			@render()

		render: ->
			rtpl = _.template Templates.FacetedSearch
			@$el.html rtpl

			if config.search
				search = new Views.Search()
				@$('.search-placeholder').html search.$el
				@listenTo search, 'change', @fetchResults

			@fetchResults()

			@

		fetchResults: (queryOptions={}) ->
			@model.set queryOptions
			@model.fetch success: => @renderFacets()
					
		facetViews: {}
		firstRender: true
		renderFacets: (data) ->
			map =
				BOOLEAN: Views.Boolean
				LIST: Views.List

			if @firstRender # TODO: make serverResponse a collectoin and check length (if length is 1 then it's the first render)
				@firstRender = false

				for own index, facetData of @model.serverResponse.facets
					@facetViews[facetData.name] = new map[facetData.type] attrs: facetData
					@listenTo @facetViews[facetData.name], 'change', @fetchResults
					@$('.facets').append @facetViews[facetData.name].$el
			else
				for own index, data of @model.serverResponse.facets
					@facetViews[data.name].update(data.options)

			@trigger 'faceted-search:results', @model.serverResponse # Trigger for external use
			@publish 'faceted-search:results', @model.serverResponse # Publish for internal use