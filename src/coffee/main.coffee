define (require) ->

	config = require 'config'
	facetViewMap = require 'facetviewmap'

	Models = 
		FacetedSearch: require 'models/main'

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

			@facetViews = {}
			@firstRender = true

			_.extend facetViewMap, options.facetViewMap
			delete options.facetViewMap
			
			_.extend config.facetNameMap, options.facetNameMap
			delete options.facetNameMap

			_.extend config, options

			queryOptions = _.extend config.queryOptions, config.textSearchOptions
			@model = new Models.FacetedSearch queryOptions
			
			@subscribe 'unauthorized', => @trigger 'unauthorized'
			@subscribe 'results:change', (response) => @trigger 'results:change', response

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
					if facetData.type of facetViewMap
						View = facetViewMap[facetData.type]
						@facetViews[facetData.name] = new View attrs: facetData
						@listenTo @facetViews[facetData.name], 'change', @fetchResults # fetchResults and renderFacets when user changes a facets state
						
						fragment.appendChild @facetViews[facetData.name].el
					else 
						console.error 'Unknown facetView', facetData.type

				@$('.facets').html fragment
			else
				for own index, data of @model.serverResponse.facets
					@facetViews[data.name].update(data.options)


		######################
		### PUBLIC METHODS ###
		######################

		next: -> @model.setCursor '_next'
		prev: -> @model.setCursor '_prev'

		hasNext: -> _.has @model.serverResponse, '_next'
		hasPrev: -> _.has @model.serverResponse, '_prev'

		sortResultsBy: (facet) -> @model.set sort: facet