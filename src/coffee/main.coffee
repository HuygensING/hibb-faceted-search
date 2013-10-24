define (require) ->
	Fn = require 'hilib/functions/general'
	config = require 'config'
	facetViewMap = require 'facetviewmap'

	Models = 
		FacetedSearch: require 'models/main'

	Views =
		Base: require 'views/base'
		TextSearch: require 'views/search'
		Facets:
			List: require 'views/facets/list'
			Boolean: require 'views/facets/boolean'
			Date: require 'views/facets/date'

	Templates =
			FacetedSearch: require 'text!html/faceted-search.html'

	class FacetedSearch extends Views.Base

		# ### Initialize
		initialize: (options) ->
			super # ANTIPATTERN

			@facetViews = {}

			_.extend facetViewMap, options.facetViewMap
			delete options.facetViewMap
			
			_.extend config.facetNameMap, options.facetNameMap
			delete options.facetNameMap

			_.extend config, options
			queryOptions = _.extend config.queryOptions, config.textSearchOptions
			
			@subscribe 'unauthorized', => @trigger 'unauthorized'

			@render()

			# Initialize the FacetedSearch model, without the queryOptions!
			@model = new Models.FacetedSearch()

			# Listen to the results:change event and (re)render the facets everytime the result changes.
			@listenTo @model, 'results:change', (response, queryOptions) => 
				@renderFacets()
				@trigger 'results:change', response, queryOptions

			# Set the queryOptions to the model. The model fetches the results from the server when the queryOptions change,
			# so the results:change event is fired and the facets are rendered. If we set the queryOptions directly when 
			# instantiating the model, than results:change will not be fired.
			@model.set queryOptions

		# ### Render
		render: ->
			rtpl = _.template Templates.FacetedSearch
			@$el.html rtpl
 
			@$('.loader').fadeIn('slow')

			if config.search
				textSearch = new Views.TextSearch()
				@$('.search-placeholder').html textSearch.$el
				@listenTo textSearch, 'change', (queryOptions) => @model.set queryOptions
				@facetViews['textSearch'] = textSearch

			@
					
		renderFacets: (data) ->
			@$('.loader').hide()

			# If the size of the serverResponses is 1 then it's the first time we render the facets
			if @model.serverResponse.length is 1
				fragment = document.createDocumentFragment()

				for own index, facetData of @model.serverResponse.last().get('facets')
					if facetData.type of facetViewMap
						View = facetViewMap[facetData.type]
						@facetViews[facetData.name] = new View attrs: facetData

						# fetchResults and renderFacets when user changes a facets state
						@listenTo @facetViews[facetData.name], 'change', (queryOptions) => @model.set queryOptions
						
						fragment.appendChild @facetViews[facetData.name].el
					else 
						console.error 'Unknown facetView', facetData.type

				@$('.facets').html fragment

			# If the size is greater than 1, the facets are already rendered and we call their update methods.
			else
				@facetViews['textSearch'].update() if @facetViews.hasOwnProperty 'textSearch'
				for own index, data of @model.serverResponse.facets
					@facetViews[data.name].update(data.options)


		# ### Methods

		# This method is called to fetch new results. When the full text search or one 
		# of the facets changes, this method is triggered. When the results are succesfully
		# returned, the facets are rerendered.
		# fetchResults: (queryOptions={}) ->
			# The set of @model adds the new queryOptions to the existing queryOptions
			# @model.set queryOptions
			# * TODO: fetch on @model change event?
			# @model.fetch success: => @renderFacets()

		next: -> @model.setCursor '_next'
		prev: -> @model.setCursor '_prev'

		hasNext: -> _.has @model.serverResponse.last(), '_next'
		hasPrev: -> _.has @model.serverResponse.last(), '_prev'

		# sortResultsBy: (facet) -> @model.set sort: facet

		reset: -> 
			for own index, data of @model.serverResponse.last().get('facets')
				@facetViews[data.name].reset() if @facetViews[data.name].reset
			@model.reset()
			# @model.fetch()
			# @fetchResults()