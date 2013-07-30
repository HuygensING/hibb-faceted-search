define (require) ->

	config = require 'config'

	Models = 
		FacetedSearch: require 'models/main'
		RestClient: require 'models/restclient'

	Views =
		Base: require 'views/base'
		Search: require 'views/search'
		Facets:
			List: require 'views/facets/list'
			Boolean: require 'views/facets/boolean'
			Date: require 'views/facets/date'

	Templates =
			FacetedSearch: require 'text!html/faceted-search.html'

	class FacetedSearch extends Views.Base

		initialize: (options) ->
			super # ANTIPATTERN

			facetViewMap = options.facetViewMap
			delete options.facetViewMap

			_.extend config, options
			_.extend config.facetViewMap, facetViewMap

			@facetViews = {}
			@firstRender = true

			queryOptions = _.extend config.queryOptions, config.textSearchOptions
			@model = new Models.FacetedSearch queryOptions

			@subscribe 'unauthorized', => @trigger 'unauthorized'

			@render()

		render: ->
			rtpl = _.template Templates.FacetedSearch
			@$el.html rtpl

			@$('.loader').fadeIn('slow')

			if config.search
				search = new Views.Search()
				@$('.search-placeholder').html search.$el
				@listenTo search, 'change', @fetchResults

			@fetchResults()

			@

		fetchResults: (queryOptions={}) ->
			@model.set queryOptions
			@model.fetch success: => @renderFacets()
					
		renderFacets: (data) ->
			@$('.loader').hide()

			if @firstRender # TODO: make a collection of serverResponses (or a hash?) and check length (if length is 1 then it's the first render)
				@firstRender = false

				fragment = document.createDocumentFragment()

				for own index, facetData of @model.serverResponse.facets
					@facetViews[facetData.name] = new config.facetViewMap[facetData.type] attrs: facetData
					@listenTo @facetViews[facetData.name], 'change', @fetchResults
					fragment.appendChild @facetViews[facetData.name].el
					# @$('.facets').append @facetViews[facetData.name].$el

				@$('.facets').html fragment
			else
				for own index, data of @model.serverResponse.facets
					@facetViews[data.name].update(data.options)


			@trigger 'faceted-search:results', @model.serverResponse # Trigger for external use
			@publish 'faceted-search:results', @model.serverResponse # Publish for internal use