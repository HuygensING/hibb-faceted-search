Backbone = require 'backbone'
$ = require 'jquery'
Backbone.$ = $

assert = require 'assert'

_ = require 'underscore'

funcky = require('funcky.el').el

Config = require './config'

QueryOptions = require './models/query-options'
SearchResults = require './collections/searchresults'

Views =
	TextSearch: require './views/text-search'
	Facets: require './views/facets'
	Results: require './views/results'
	ListFacet: require './views/facets/list'

tpl = require '../jade/main.jade'

class MainView extends Backbone.View

	# ### Initialize
	initialize: (options={}) ->
		# The facetViewMap cannot be part of the config, because of circular reference.
		# The facetViewMap is removed from the options, so it is not added to config.
		# Do this before @extendConfig.
		if options.facetViewMap?
			@facetViewMap = _.clone options.facetViewMap
			delete options.facetViewMap
		
		@extendConfig options

		# The text search is split with an init method and a render method, because
		# the options are transformed in the init and needed for initQueryOptions.
		if @config.get('textSearch') is 'simple' or @config.get('textSearch') is 'advanced'
			@initTextSearch()

		@initQueryOptions()

		@initSearchResults()

		@render()

		if @config.get 'development'
			@searchResults.add JSON.parse localStorage.getItem('faceted-search-dev-model')
			@searchResults.cachedModels['{"facetValues":[],"sortParameters":[]}'] = @searchResults.first()
			setTimeout (=> @$('.overlay').hide()), 100

	# ### Render
	render: ->
		tpl = @config.get('templates').main if @config.get('templates').hasOwnProperty 'main'

		@el.innerHTML = tpl()

		# Instantiate the Facets view after instantiating the QueryOptions model and
		# before rendering the textSearch. The textSearchPlaceholder can be located
		# in the main and in the facets template. So we render the facets view to
		# get (potentially) the div.text-search-placeholder and call renderFacets
		# in @update, to actually render the separate facet views.
		@initFacets @facetViewMap

		@$('.faceted-search').addClass "search-type-#{@config.get('textSearch')}"

		@renderTextSearch()

		if @config.get 'results'
			@renderResults()

		@

	initTextSearch: ->
		@textSearch = new Views.TextSearch config: @config
		@listenTo @textSearch, 'change', (queryOptions) =>
			@queryOptions.set queryOptions, silent: true

		@listenTo @textSearch, 'search', =>
			@search()
		
	renderTextSearch: ->
		return unless @textSearch?

		@textSearch.render()
		textSearchPlaceholder = @el.querySelector('.text-search-placeholder')
		textSearchPlaceholder.parentNode.replaceChild @textSearch.el, textSearchPlaceholder

	renderResults: ->
		@$el.addClass 'with-results'

		@results = new Views.Results
			el: @$('.results')
			config: @config
			searchResults: @searchResults

		@listenTo @results, 'result:click', (data) ->
			@trigger 'result:click', data
			
		@listenTo @results, 'result:layer-click', (layer, data) ->
			@trigger 'result:layer-click', layer, data

		@listenTo @results, 'change:sort-levels', (sortParameters) ->
			@sortResultsBy sortParameters

	# ### Events
	events: ->
		'click ul.facets-menu li.collapse-expand': (ev) -> @facets.toggle ev
		# Don't use @refresh as String, because the ev object will be passed.
		'click ul.facets-menu li.reset': 'onReset'
		'click ul.facets-menu li.switch button': 'onSwitchType'

	onSwitchType: (ev) ->
		ev.preventDefault()

		textSearch = if @config.get('textSearch') is 'advanced' then 'simple' else 'advanced'
		@config.set textSearch: textSearch

		@$('.faceted-search').toggleClass 'search-type-simple'
		@$('.faceted-search').toggleClass 'search-type-advanced'

		if @searchResults.length is 1
			@search()
		else if @searchResults.length > 1
			@update()

	onReset: (ev) ->
		ev.preventDefault()
		@reset()

	# ### Methods

	destroy: ->
		@facets.destroy() if @facets?
		@textSearch.destroy() if @textSearch?
		@results.destroy() if @results?

		@remove()

	extendConfig: (options) ->
		# Create a map of properties which need to be extended (not overriden)
		toBeExtended = 
			facetTitleMap: null
			textSearchOptions: null
			labels: null

		# Copy the keys to a different map and remove from the options, otherwise
		# the defaults will be overriden.
		for key, value of toBeExtended
			toBeExtended[key] = options[key]
			delete options[key]

		@config = new Config options

		# Extend en (re)set the extended property values.
		for key, value of toBeExtended
			@config.set key, _.extend @config.get(key), value

		# Set the default of config type in case the user sends an unknown string.
		@config.set textSearch: 'advanced' if ['none', 'simple', 'advanced'].indexOf(@config.get('textSearch')) is -1

		@listenTo @config, 'change:resultRows', =>
			@refresh()

	initQueryOptions: ->
		attrs = _.extend @config.get('queryOptions'), @textSearch.model.attributes
		# attrs = @config.get('queryOptions')
		delete attrs.term
		@queryOptions = new QueryOptions attrs

		if @config.get 'autoSearch'
			@listenTo @queryOptions, 'change', => @search()

	initSearchResults: ->
		@searchResults = new SearchResults null, config: @config

		@listenToOnce @searchResults, 'change:results', (responseModel) =>
			# console.log responseModel
			# @config.set sortableFields: responseModel.get('sortableFields')

			if responseModel.has 'fullTextSearchFields'
				# Clone textSearchOptions to force Backbone's change event to fire.
				textSearchOptions = _.clone(@config.get('textSearchOptions'))
				textSearchOptions.fullTextSearchParameters = responseModel.get('fullTextSearchFields')
				@config.set textSearchOptions: textSearchOptions

		# Listen to the change:results event and (re)render the facets everytime the result changes.
		@listenTo @searchResults, 'change:results', (responseModel) =>
			# Nothing needs updating if the facets aren't visible.
			@update() if @config.get('textSearch') isnt 'simple'

			@trigger 'change:results', responseModel

		# The cursor is changed when @next or @prev are called. They are rarely used, since pagination uses @page and thus change:page.
		@listenTo @searchResults, 'change:cursor', (responseModel) => @trigger 'change:results', responseModel

		@listenTo @searchResults, 'change:page', (responseModel, database) => @trigger 'change:page', responseModel, database

		# Backbone triggers a request event when sending a request to the server.
		# In searchResults the request event is triggered manually, because searchResults.sync
		# isnt used.
		@listenTo @searchResults, 'request', => @showLoader()
		# Same goes for sync, but this event is triggered when the response is received.
		@listenTo @searchResults, 'sync', => @hideLoader()

		@listenTo @searchResults, 'unauthorized', => @trigger 'unauthorized'
		@listenTo @searchResults, 'request:failed', (res) => @trigger 'request:failed', res

	initFacets: (viewMap={}) ->
		@facets = new Views.Facets
			viewMap: viewMap
			config: @config

		# Replace the facets placeholder with the 'real' DOM element (@facets.el).
		facetsPlaceholder = @el.querySelector('.facets-placeholder')
		facetsPlaceholder.parentNode.replaceChild @facets.el, facetsPlaceholder

		@listenTo @facets, 'change', (queryOptions, options) => @queryOptions.set queryOptions, options

	showLoader: ->
		overlay = @el.querySelector('.overlay')
		return false if overlay.style.display is 'block'

		# Calculate the width and height of the overlay and
		# the position of the loader.
		calc = =>
			# Calculate the bounding box of the faceted search.
			facetedSearch = @el.querySelector('.faceted-search')
			fsBox = funcky(facetedSearch).boundingBox()

			# Calculate the left position of the loader, which should
			# be half way the width of the faceted search.
			left =  (fsBox.left + fsBox.width/2 - 12) + 'px'

			# Calculate the top position of the loader, which should
			# be half way the height of the faceted search.
			# If the height is heigher than the window, place it at the
			# half (50vh).
			top = (fsBox.top + fsBox.height/2 - 12) + 'px'
			top = '50vh' if fsBox.height > window.innerHeight

			loader = overlay.children[0]
			loader.style.left = left
			loader.style.top = top

			overlay.style.width = fsBox.width + 'px'
			overlay.style.height = fsBox.height + 'px'
			overlay.style.display = 'block'

		# Place calcing the overlay and loader position to the end of the
		# event stack.
		setTimeout calc, 0

	hideLoader: ->
		@el.querySelector('.overlay').style.display = 'none'

	update: ->
		facets = @searchResults.getCurrent().get('facets')
		# console.log @searchResults.queryAmount, @searchResults.length
		# If the size of the searchResults is 1 then it's the first time we render the facets
		if @searchResults.length is 1
			@facets.renderFacets facets
		# If the size is greater than 1, the facets are already rendered and we call their update methods.
		else if @searchResults.length > 1
			@facets.update facets

	# ### Interface

	page: (pagenumber, database) ->
		@searchResults.page pagenumber, database

	next: ->
		@searchResults.moveCursor '_next'

	prev: ->
		@searchResults.moveCursor '_prev'

	hasNext: ->
		@searchResults.getCurrent().has '_next'

	hasPrev: ->
		@searchResults.getCurrent().has '_prev'

	# Sort the results by the parameters given. The parameters are an array of
	# objects, containing 'fieldName' and 'direction': [{fieldName: "name", direction: "desc"}]
	# When the queryOptions are set, a change event is triggered and send to the server.
	sortResultsBy: (sortParameters) ->
		@queryOptions.set
			sortParameters: sortParameters
			# The resultFields are changed when the sortParameters are changed,
			# because the server only returns the given fields. If we do this in
			# the model on change, the change event would be triggered twice.
			# An alternative is creating a method for it.
			resultFields: _.pluck(sortParameters, 'fieldname')

	# Silently change @attributes and trigger a change event manually afterwards.
	# arguments.cache Boolean Tells searchResults if we want to fetch result from cache.
	# 	In an app where data is dynamic, we usually don't want cache (get new result from server),
	#	in an app where data is static, we can use cache to speed up the app.
	reset: (cache=false) ->
		@textSearch.reset() if @textSearch?
		@results.reset() if @results?

		@facets.reset()

		@queryOptions.reset()

		@searchResults.clearCache() unless cache

		@search cache: cache

	###
	A refresh of the Faceted Search means (re)sending the current @attributes (queryOptions) again.
	We set the cache flag to false, otherwise the searchResults collection will return the cached
	model, instead of fetching a new one from the server.
	The newQueryOptions are optional. The can be used to add or update one or more queryOptions
	before sending the same (or now altered) queryOptions to the server again.
	###
	refresh: (newQueryOptions={}) ->
		if Object.keys(newQueryOptions).length > 0
			@queryOptions.set newQueryOptions, silent: true
			
		@search cache: false

	search: (options) ->
		@searchResults.runQuery @queryOptions.attributes, options

	###
	Search for a single value. Programmatic version of a user
	checking (clicking the checkbox) one value right after init.

	TODO: this is a dirty implementation. Better would be to reset the
	views, reset and update the queryOptions and run @search.

	@param {string} facetName - Name of the facet.
	@param {string} value - Value of option to be selected.
	@param {object} options - Options to pass to @search
	###
	searchValue: (facetName, value, options) ->
		@queryOptions.reset()

		for name, view of @facets.views
			if view instanceof Views.ListFacet
				view.revert()

		assert.ok @$(".facet[data-name=\"#{facetName}\"] li[data-value=\"#{value}\"]").length > 0, ".facet[data-name=\"#{facetName}\"] li[data-value=\"#{value}\"] not found!"

		@$(".facet[data-name=\"#{facetName}\"] li[data-value=\"#{value}\"]").click()


module.exports = MainView