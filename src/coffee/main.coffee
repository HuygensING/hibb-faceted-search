require.config
	baseUrl: 'compiled/js'
	paths:
		'tpls': '../templates'
		'jade': '../lib/jade/runtime'
		'hilib': '../lib/hilib/compiled'

define (require) ->
	Fn = require 'hilib/functions/general'
	dom = require 'hilib/functions/dom'
	pubsub = require 'hilib/mixins/pubsub'

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

	# Templates =
	# 		FacetedSearch: require 'text!html/faceted-search.html'

	tpls = require 'tpls'

	class FacetedSearch extends Backbone.View

		# ### Initialize
		initialize: (options) ->
			# super # ANTIPATTERN

			@facetViews = {}

			_.extend @, pubsub

			_.extend facetViewMap, options.facetViewMap
			delete options.facetViewMap
			
			_.extend config.facetNameMap, options.facetNameMap
			delete options.facetNameMap

			_.extend config, options
			queryOptions = _.extend config.queryOptions, config.textSearchOptions
			
			@render()

			@subscribe 'unauthorized', => @trigger 'unauthorized'
			# Listen to the results:change event and (re)render the facets everytime the result changes.
			@subscribe 'change:results', (responseModel, queryOptions) => 
				@renderFacets()
				@trigger 'results:change', responseModel, queryOptions
			
			# Initialize the FacetedSearch model, without the queryOptions!
			@model = new Models.FacetedSearch queryOptions

			@listenTo @model.searchResults, 'request', =>
				el = @el.querySelector '.faceted-search'
				div = @el.querySelector '.overlay'
				div.style.width = el.clientWidth + 'px'
				div.style.height = el.clientHeight + 'px'
				div.style.display = 'block'

				loader = @el.querySelector '.overlay img'
				bb = dom(el).boundingBox()
				loader.style.left = bb.left + bb.width/2 + 'px'

				top = if bb.height > document.documentElement.clientHeight then '50vh' else bb.height/2 + 'px'
				loader.style.top = top
				
			@listenTo @model.searchResults, 'sync', =>
				el = @el.querySelector '.overlay'
				el.style.display = 'none'
			
			# Set the queryOptions to the model. The model fetches the results from the server when the queryOptions change,
			# so the results:change event is fired and the facets are rendered. If we set the queryOptions directly when 
			# instantiating the model, than results:change will not be fired.
			# @model.initOptions queryOptions

		# ### Render
		render: ->
			# rtpl = _.template Templates.FacetedSearch
			rtpl = tpls['faceted-search/main']()
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

			# If the size of the searchResults is 1 then it's the first time we render the facets
			if @model.searchResults.length is 1
				fragment = document.createDocumentFragment()

				for own index, facetData of @model.searchResults.current.get('facets')
					if facetData.type of facetViewMap
						View = facetViewMap[facetData.type]
						@facetViews[facetData.name] = new View attrs: facetData

						# fetchResults and renderFacets when user changes a facets state
						@listenTo @facetViews[facetData.name], 'change', (queryOptions) => @model.set queryOptions
						
						fragment.appendChild @facetViews[facetData.name].el
					else 
						console.error 'Unknown facetView', facetData.type
				start = new Date()
				# @$('.facets').html fragment
				@el.querySelector('.facets').appendChild fragment
				console.log (new Date() - start)/1000 + 's'

			# If the size is greater than 1, the facets are already rendered and we call their update methods.
			else
				@facetViews['textSearch'].update() if @facetViews.hasOwnProperty 'textSearch'
				for own index, data of @model.searchResults.current.get('facets')
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

		next: -> @model.searchResults.moveCursor '_next'
		prev: -> @model.searchResults.moveCursor '_prev'

		hasNext: -> @model.searchResults.current.has '_next'
		hasPrev: -> @model.searchResults.current.has '_prev'

		# sortResultsBy: (facet) -> @model.set sort: facet

		reset: -> 
			for own index, data of @model.searchResults.last().get('facets')
				@facetViews[data.name].reset() if @facetViews[data.name].reset
			@model.reset()
			# @model.fetch()
			# @fetchResults()