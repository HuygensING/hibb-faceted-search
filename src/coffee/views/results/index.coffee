Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

Views =
	Result: require './result'
	SortLevels: require './sort'
	Pagination: require 'hibb-pagination'

tpl = require './index.jade'

listItems = []


class Results extends Backbone.View

	### options
	@constructs
	@param {object} this.options={}
	@prop {Backbone.Model} options.config
	@prop {Backbone.Collection} options.searchResults
	###
	initialize: (@options={}) ->
		###
		@prop resultItems
		###
		@resultItems = []

		@isMetadataVisible = true

		@listenTo @options.searchResults, 'change:page', @renderResultsPage


		@listenTo @options.searchResults, 'change:results', (responseModel) =>
			@$('header h3.numfound').html "#{@options.config.get('labels').numFound} #{responseModel.get('numFound')} #{@options.config.get('termPlural')}"
			
			@renderPagination responseModel

			@renderResultsPage responseModel

		@subviews = {}

		@render()

	# ### Render
	render: ->
		@$el.html tpl
			showMetadata: @options.config.get 'showMetadata'
			resultsPerPage: @options.config.get 'resultRows'
			config: @options.config

		@renderLevels()

		$(window).resize =>
			pages = @$('div.pages')
			pages.height $(window).height() - pages.offset().top

		@

	renderLevels: ->
		return unless @options.config.get('sortLevels')

		@subviews.sortLevels.destroy() if @subviews.sortLevels?
		@subviews.sortLevels = new Views.SortLevels
			config: @options.config
			levels: @options.config.get 'levels'
			entryMetadataFields: @options.config.get 'sortableFields'
		@$('header nav ul').prepend @subviews.sortLevels.$el

		@listenTo @subviews.sortLevels, 'change', (sortParameters) =>
			@trigger 'change:sort-levels', sortParameters

	###
	@method renderResultsPage
	@param {object} responseModel - The model returned by the server.
	###
	renderResultsPage: (responseModel) ->
		# Search results are cached by @options.searchresults, so on render
		# all results are properly destroyed and re-rendered.
		@destroyResultItems()
		@$("div.pages").html('')

		# Check if the results are a generated for a full text search.
		# This is only necessary for eLaborate.
		fulltext = false
		if responseModel.get('results').length > 0
			if Object.keys(responseModel.get('results')[0].terms).length > 0
				fulltext = true
		
		# Create a document fragment and append entry listitem views.
		frag = document.createDocumentFragment()

		for result in responseModel.get 'results'
			# Instantiate a new list item.
			result = new Views.Result
				data: result
				fulltext: fulltext
				config: @options.config

			# Store the result so we can destroy them when needed.
			@resultItems.push result

			# Listen to the click event, which bubbles up all the way to the faceted search, so it can pass
			# it to the parent view and trigger the router to navigate to the entry.
			@listenTo result, 'click', (resultData) ->
				@trigger 'result:click', resultData

			@listenTo result, 'layer:click', (layer, resultData) ->
				@trigger 'result:layer-click', layer, resultData

			# Add the list item to the frag.
			frag.appendChild result.el

		# Add the frag to the dom.
		pageNumber= @subviews.pagination.getCurrentPageNumber()
		ul = $("<ul class=\"page\" data-page-number=\"#{pageNumber}\" />")
		ul.html frag

		@$("div.pages").append ul

	renderPagination: (responseModel) ->
		if @subviews.pagination?
			@stopListening @subviews.pagination
			@subviews.pagination.destroy()

		@subviews.pagination = new Views.Pagination
			resultsStart: responseModel.get('start')
			resultsPerPage: @options.config.get 'resultRows'
			resultsTotal: responseModel.get('numFound')
		@listenTo @subviews.pagination, 'change:pagenumber', @changePage
		@$('header .pagination').html @subviews.pagination.el

	changePage: (pageNumber) ->
		pages = @$ 'div.pages'
		pages.find('ul.page').hide()

		page = pages.find("ul.page[data-page-number=\"#{pageNumber}\"]")

		if page.length > 0
			page.show()
		else
			@options.searchResults.page pageNumber

	# ### Events
	events: ->
		'change li.show-metadata input': 'showMetadata'
		'change li.results-per-page select': 'onChangeResultsPerPage'

	onChangeResultsPerPage: (ev) ->
		t = ev.currentTarget
		@options.config.set 'resultRows', t.options[t.selectedIndex].value

	showMetadata: (ev) ->
		@isMetadataVisible = ev.currentTarget.checked
		@$('.metadata').toggle @isMetadataVisible

	reset: ->
		@renderLevels()

	destroy: ->
		@destroyResultItems()
		@subviews.sortLevels.destroy()

	destroyResultItems: ->
		item.destroy() for item in @resultItems

module.exports = Results