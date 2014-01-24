require.config
	baseUrl: 'compiled/js'
	paths:
		'tpls': '../templates'
		'jade': '../lib/jade/runtime'
		'hilib': '../../hilib/compiled'

define (require) ->
	Fn = require 'hilib/functions/general'
	dom = require 'hilib/functions/dom'
	pubsub = require 'hilib/mixins/pubsub'

	config = require 'config'
	facetViewMap = require 'facetviewmap'

	Models = 
		FacetedSearch: require 'models/main'

	Views =
		Base: require 'hilib/views/base'
		TextSearch: require 'views/search'
		Facets:
			List: require 'views/facets/list'
			Boolean: require 'views/facets/boolean'
			Date: require 'views/facets/date'

	# Templates =
	# 		FacetedSearch: require 'text!html/faceted-search.html'

	tpls = require 'tpls'

	class FacetedSearch extends Views.Base

		# ### Initialize
		initialize: (options) ->
			# super # ANTIPATTERN

			@facetViews = {}

			_.extend @, pubsub

			# The facetViewMap is a mapping of all (internally) available facets (List, Boolean, Date, etc).
			# The map can be extended by user defined facets, by passing a mapping in the options.
			_.extend facetViewMap, options.facetViewMap
			delete options.facetViewMap

			# The facetNameMap is used for giving user friendly names to facets. Sometimes the database has
			# an unwanted name or no name, so the user is given the option to pass their own.
			_.extend config.facetNameMap, options.facetNameMap
			delete options.facetNameMap

			_.extend config, options
			queryOptions = _.extend config.queryOptions, config.textSearchOptions
			
			@render()

			# Listen to the results:change event and (re)render the facets everytime the result changes.
			@subscribe 'change:results', (responseModel) => 
				@renderFacets()
				@trigger 'results:change', responseModel

			@subscribe 'change:cursor', (responseModel) => 
				@trigger 'results:change', responseModel

			@subscribe 'change:page', (responseModel, database) => 
				@trigger 'results:change', responseModel, database
			
			# Initialize the FacetedSearch model.
			@model = new Models.FacetedSearch queryOptions

			@listenTo @model.searchResults, 'request', =>
				el = @el.querySelector '.faceted-search'
				div = @el.querySelector '.overlay'
				div.style.width = el.clientWidth + 'px'
				div.style.height = el.clientHeight + 'px'
				div.style.display = 'block'

				loader = @el.querySelector '.overlay div'
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

			@
					
		renderFacets: (data) ->
			@$('.loader').hide()
			@$('.faceted-search > i.fa-compress').css 'visibility', 'visible'

			# If the size of the searchResults is 1 then it's the first time we render the facets
			if @model.searchResults.length is 1
				fragment = document.createDocumentFragment()

				if config.search
					textSearch = new Views.TextSearch()
					@$('.search-placeholder').html textSearch.el
					@listenTo textSearch, 'change', (queryOptions) => @model.set queryOptions
					@facetViews['textSearch'] = textSearch

				for own index, facetData of @model.searchResults.current.get('facets')
					if facetData.type of facetViewMap
						View = facetViewMap[facetData.type]
						@facetViews[facetData.name] = new View attrs: facetData

						# fetchResults and renderFacets when user changes a facets state
						@listenTo @facetViews[facetData.name], 'change', (queryOptions) => @model.set queryOptions
						
						fragment.appendChild @facetViews[facetData.name].el
					else 
						console.error 'Unknown facetView', facetData.type

				@el.querySelector('.facets').appendChild fragment

			# If the size is greater than 1, the facets are already rendered and we call their update methods.
			else if @model.searchResults.length > 1
				@update()

		# ### Events
		events: ->
			'click i.fa-compress': 'toggleFacets'
			'click i.fa-expand': 'toggleFacets'

		# ### Methods

		# This method is called to fetch new results. When the full text search or one 
		# of the facets changes, this method is triggered. When the results are succesfully
		# returned, the facets are rerendered.
		# fetchResults: (queryOptions={}) ->
			# The set of @model adds the new queryOptions to the existing queryOptions
			# @model.set queryOptions
			# * TODO: fetch on @model change event?
			# @model.fetch success: => @renderFacets()

		# The facets are slided one by one. When the slide of a facet is finished, the
		# next facet starts sliding. That's why we use a recursive function.
		toggleFacets: (ev) ->
			$button = $ ev.currentTarget
			open = $button.hasClass 'fa-expand'
			$button.toggleClass 'fa-compress'
			$button.toggleClass 'fa-expand'

			facetNames = _.keys @facetViews
			index = 0
			
			slideFacet = =>
				facetName = facetNames[index++]
				facet = @facetViews[facetName]

				if facet?
					# Don't close textSearch facet, but close others.
					if facetName is 'textSearch'
						slideFacet()
					else
						if open
							facet.showBody -> slideFacet()
						else
							facet.hideBody -> slideFacet()

			slideFacet()

		page: (pagenumber, database) -> @model.searchResults.current.page pagenumber, database

		next: -> @model.searchResults.moveCursor '_next'
		prev: -> @model.searchResults.moveCursor '_prev'

		hasNext: -> @model.searchResults.current.has '_next'
		hasPrev: -> @model.searchResults.current.has '_prev'

		# TODO: Restore change:sort listener
		sortResultsBy: (field) -> @model.set sort: field

		update: ->
			@facetViews.textSearch.update() if @facetViews.hasOwnProperty 'textSearch'
			
			for own index, data of @model.searchResults.current.get('facets')
				# console.log 'ALSO HERE 1' if data.name is 'textSearch'
				@facetViews[data.name].update(data.options)

		reset: ->
			@facetViews.textSearch.reset() if @facetViews.hasOwnProperty 'textSearch'

			for own index, data of @model.searchResults.last().get('facets')
				# console.log 'ALSO HERE 2' if data.name is 'textSearch'
				@facetViews[data.name].reset() if @facetViews[data.name].reset
			@model.reset()