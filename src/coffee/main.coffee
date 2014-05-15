Backbone = require 'backbone'
$ = require 'jquery'
Backbone.$ = $

_ = require 'underscore'

Fn = require 'hilib/src/utils/general'
dom = require 'hilib/src/utils/dom'

pubsub = require 'hilib/src/mixins/pubsub'

config = require './config'
facetViewMap = require './facetviewmap'

MainModel = require './models/main'

Views =
	TextSearch: require './views/search'
	Facets:
		List: require './views/facets/list'
		Boolean: require './views/facets/boolean'
		Date: require './views/facets/date'

tpl = require '../jade/main.jade'

class MainView extends Backbone.View

	# ### Initialize
	initialize: (options) ->

		@facetViews = {}

		_.extend @, pubsub

		_.extend facetViewMap, options.facetViewMap
		delete options.facetViewMap

		_.extend config.facetNameMap, options.facetNameMap
		delete options.facetNameMap

		_.extend config, options
		queryOptions = _.extend config.queryOptions, config.textSearchOptions

		# Set the default of config type in case the user sends an unknown string.
		config.textSearch = 'advanced' if ['none', 'simple', 'advanced'].indexOf(config.textSearch) is -1
		
		# Initialize the FacetedSearch model.
		@model = new MainModel queryOptions
		
		@render()

		@addListeners()

	# ### Render
	render: ->
		@$el.html tpl()

		if config.templates.hasOwnProperty 'main'
			@$('form').html config.templates.main()

		@$('.faceted-search').addClass "search-type-#{config.textSearch}"

		# See config for more about none, simple and advanced options.
		if config.textSearch is 'simple' or 'advanced'
			@renderTextSearch()
		
		if config.textSearch is 'none' or 'advanced'
			setTimeout @showLoader.bind(@), 0

		@

	renderTextSearch: ->
		textSearch = new Views.TextSearch()
		@$('.text-search-placeholder').html textSearch.el

		@listenTo textSearch, 'change', (queryOptions) => @model.set queryOptions
		@listenTo textSearch, 'change:silent', (queryOptions) => @model.set queryOptions, silent: true
		
		# TODO Remove textSearch from @facetViews
		@facetViews['textSearch'] = textSearch

	destroyFacets: ->
		for own viewName, view of @facetViews
			if viewName isnt 'textSearch' 
				view.destroy()
				delete @facetViews[viewName]

	createFacetView: (facetData) =>
		if _.isString(facetData)
			facetData = _.findWhere @model.searchResults.first().get('facets'), name: facetData

		View = facetViewMap[facetData.type]
		view = @facetViews[facetData.name] = new View attrs: facetData

		# fetchResults and updateFacets when user changes a facets state
		@listenTo view, 'change', (queryOptions) => @model.set queryOptions

		view
	renderFacets: ->

		if config.templates.hasOwnProperty 'main'
			for facetData, index in @model.searchResults.current.get('facets')
				if facetViewMap.hasOwnProperty facetData.type
					@$(".#{facetData.name}-placeholder").html @createFacetView(facetData).el
		else
			fragment = document.createDocumentFragment()		

			for own index, facetData of @model.searchResults.current.get('facets')
				if facetViewMap.hasOwnProperty facetData.type
					fragment.appendChild @createFacetView(facetData).el
					fragment.appendChild document.createElement 'hr'
				else 
					console.error 'Unknown facetView', facetData.type

			@$('.facets').html fragment
				
	updateFacets: ->
		return if config.textSearch is 'simple'

		@$('.loader').hide()
		@$('.faceted-search > i.fa').css 'visibility', 'visible'

		current = @model.searchResults.current

		# If the size of the searchResults is 1 then it's the first time we render the facets
		if @model.searchResults.length is 1 or current.get('reset')
			
			@destroyFacets()

			# Render facets and attach to DOM
			@renderFacets()

		# If the size is greater than 1, the facets are already rendered and we call their update methods.
		else
			@update()

	# ### Events
	events: ->
		'click ul.facets-menu li.collapse-expand': 'toggleFacets'
		# Don't use @refresh as String, because the ev object will be passed.
		'click ul.facets-menu li.reset': (ev) -> 
			ev.preventDefault()
			@reset()
		'click ul.facets-menu li.switch button': (ev) ->
			ev.preventDefault()

			config.textSearch = if config.textSearch is 'advanced' then 'simple' else 'advanced'

			@$('.faceted-search').toggleClass 'search-type-simple'
			@$('.faceted-search').toggleClass 'search-type-advanced'

			if @model.searchResults.length is 0
				@model.trigger 'change'
			else
				@update()

	# The facets are slided one by one. When the slide of a facet is finished, the
	# next facet starts sliding. That's why we use a recursive function.
	toggleFacets: (ev) ->
		ev.preventDefault()

		icon = $(ev.currentTarget).find('i.fa')
		span = $(ev.currentTarget).find('span')

		open = icon.hasClass 'fa-expand'
		icon.toggleClass 'fa-compress'
		icon.toggleClass 'fa-expand'

		text = if open then 'Collapse' else 'Expand'
		span.text "#{text} facets"

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

	# ### Methods

	destroy: -> 
		@destroyFacets()
		@remove()

	addListeners: ->
		# Listen to the change:results event and (re)render the facets everytime the result changes.
		@listenTo @model.searchResults, 'change:results', (responseModel) =>
			@updateFacets()
			@trigger 'change:results', responseModel

		# The cursor is changed when @next or @prev are called. They are rarely used, since hilib
		# pagination uses @page.
		@listenTo @model.searchResults, 'change:cursor', (responseModel) => @trigger 'change:results', responseModel

		@listenTo @model.searchResults, 'change:page', (responseModel, database) => @trigger 'change:page', responseModel, database
		
		@listenTo @model.searchResults, 'request', @showLoader
			
		@listenTo @model.searchResults, 'sync', => @$('.overlay').hide()

		@listenTo @model.searchResults, 'unauthorized', => @trigger 'unauthorized'

	showLoader: ->
		facetedSearch = @$('.faceted-search')
		overlay = @$('.overlay')
		loader = overlay.find('div')

		overlay.width facetedSearch.width()
		overlay.height facetedSearch.height()
		overlay.css 'display', 'block'

		left =  facetedSearch.offset().left + facetedSearch.width()/2 - 12
		loader.css 'left', left

		top =  facetedSearch.offset().top + facetedSearch.height()/2 - 12
		top = '50vh' if facetedSearch.height() > $(window).height()
		loader.css 'top', top

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
			@facetViews[data.name]?.update(data.options)

	reset: ->
		@facetViews.textSearch.reset() if @facetViews.hasOwnProperty 'textSearch'

		for own facetView of @facetViews
			facetView.reset() if facetView.reset?

		@model.reset()

	refresh: (newQueryOptions) -> @model.refresh newQueryOptions

module.exports = MainView