define (require) ->

	Models = 
		FacetedSearch: require 'models/main'

	Views =
		Base: require 'views/base'
		Search: require 'views/search'
		List: require 'views/facets/list'
		Boolean: require 'views/facets/boolean'

	Templates =
			FacetedSearch: require 'text!html/faceted-search.html'

	class FacetedSearch extends Views.Base
		facetData: []
		facetViews: {}

		initialize: (options) ->
			super # ANTIPATTERN

			@model = new Models.FacetedSearch options

			@subscribe 'unauthorized', => @trigger 'unauthorized'

			@render()

		render: ->
			rtpl = _.template Templates.FacetedSearch
			@$el.html rtpl

			if @model.get 'search'
				search = new Views.Search()
				@$('.search-placeholder').html search.$el
				@listenTo search, 'change', @fetchResults

			@fetchResults()

			@

		fetchResults: (queryOptions={}) ->
			@model.setQueryOptions queryOptions

			@model.fetch
				success: (model, response, options) =>
					@renderFacets response
					@trigger 'faceted-search:results', response
		
		renderFacets: (data) ->
			map =
				BOOLEAN: Views.Boolean
				LIST: Views.List

			if not @facetData.length
				@facetData = data.facets

				for own index, facetData of data.facets
					@facetViews[facetData.name] = new map[facetData.type] attrs: facetData
					@listenTo @facetViews[facetData.name], 'change', @fetchResults
					@$('.facets').append @facetViews[facetData.name].$el
			else
				for own index, data of data.facets
					@facetViews[data.name].update(data.options)

			@publish 'faceted-search:facets-rendered'