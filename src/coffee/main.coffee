define (require) ->

	Models = 
		FacetedSearch: require 'models/main'

	Views =
		Base: require 'views/base'
		List: require 'views/facets/list'
		Search: require 'views/search'

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
			# TODO: Add Views.Boolean
			if not @facetData.length
				@facetData = data.facets

				for own index, data of data.facets
					@facetViews[data.name] = new Views.List attrs: data
					@listenTo @facetViews[data.name], 'change', @fetchResults
					@$('.facets').append @facetViews[data.name].$el
			else
				for own index, data of data.facets
					@facetViews[data.name].update(data.options)
				# view.update data.facets

			@publish 'faceted-search:facets-rendered'