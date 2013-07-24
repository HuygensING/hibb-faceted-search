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

			_.extend config, options

			@facetViews = {}
			@firstRender = true

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
					
		renderFacets: (data) ->
			map =
				BOOLEAN: Views.Facets.Boolean
				LIST: Views.Facets.List
				DATE: Views.Facets.Date

			if @firstRender # TODO: make serverResponse a collectoin and check length (if length is 1 then it's the first render)
				@firstRender = false

				for own index, facetData of @model.serverResponse.facets
					@facetViews[facetData.name] = new map[facetData.type] attrs: facetData
					@listenTo @facetViews[facetData.name], 'change', @fetchResults
					@$('.facets').append @facetViews[facetData.name].$el

				# console.log @facetViews
			else
				# console.log 'server response', @model.serverResponse
				for own index, data of @model.serverResponse.facets
					@facetViews[data.name].update(data.options)

				# _.each @facetViews, (view, name) =>
				# 	facetInResponse = _.findWhere @model.serverResponse.facets, name: name
				# 	@facetViews[name].update() if not facetInResponse?
				# # console.log 'empties', empties


			@trigger 'faceted-search:results', @model.serverResponse # Trigger for external use
			@publish 'faceted-search:results', @model.serverResponse # Publish for internal use