Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

Views =
	Result: require './result'
	SortLevels: require './sort-levels'
	Pagination: require 'huygens-backbone-pagination'

tpl = require '../../../jade/results/main.jade'

listItems = []


class Results extends Backbone.View

	### options
	@constructs
	@param {object} this.options={}
	@prop {object} options.config
	@prop {array} options.levels
	@prop {array} options.entryMetadataFields
	@prop {Backbone.Collection} options.searchResults
	###
	initialize: (@options={}) ->
		@options.levels ?= []
		@options.entryMetadataFields ?= []

		###
		@prop resultItems
		###
		@resultItems = []

		@listenTo @options.searchResults, 'change:page', @renderResultsPage


		@listenTo @options.searchResults, 'change:results', (responseModel) =>
			@$('header h3.numfound').html "Found #{responseModel.get('numFound')} #{@options.config.get('entryTermPlural')}"
			
			@renderPagination responseModel

			@renderResultsPage responseModel, true

		@subviews = {}

		@render()

	# ### Render
	render: ->
		@$el.html tpl()

		@renderLevels()

		$(window).resize =>
			pages = @$('div.pages')
			pages.height $(window).height() - pages.offset().top

		@

	renderLevels: ->
		@subviews.sortLevels = new Views.SortLevels
			levels: @options.levels
			entryMetadataFields: @options.entryMetadataFields
		@$('header nav ul').prepend @subviews.sortLevels.$el

		@listenTo @subviews.sortLevels, 'change', (sortParameters) => @trigger 'change:sort-levels', sortParameters

	###
	@method renderResultsPage
	@param {object} responseModel - The model returned by the server.
	@param {boolean} [removeCache=false] - Remove the rendered pages? This occurs when the results change, but not when the page changes.
	###
	renderResultsPage: (responseModel, removeCache=false) ->
		if removeCache
			item.destroy() for item in @resultItems
			@$("div.pages").html('')

		# eLaborate uses "*:*" when no searchterm was entered, Timbuctoo uses "*".
		fulltext = responseModel.has('term') and responseModel.get('term').indexOf('*:*') is -1 and responseModel.get('term').indexOf('*') is -1

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

	showMetadata: (ev) -> @$('.metadata').toggle ev.currentTarget.checked

module.exports = Results