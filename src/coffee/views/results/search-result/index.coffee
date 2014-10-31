$ = require 'jquery'
_ = require 'underscore'

dom = require 'hilib/src/utils/dom'

config = require '../../models/config'

Views =
	Base: require 'hilib/src/views/base'
	EntryListItem: require './views/entry-list-item'
	SortLevels: require '../sort-levels'
	Pagination: require 'hilib/src/views/pagination/main'

tpl = require './templates/main.jade'

listItems = []

class SearchResult extends Views.Base

	className: 'results-placeholder'

	initialize: (@options={}) ->
		super

		@render()

	# ### Render
	render: ->
		@$el.html tpl()

		@renderLevels()

		@renderListItems()

		$(window).resize =>
			entries = @$('div.entries')
			entries.height $(window).height() - entries.offset().top

		@

	renderLevels: ->
		@subviews.sortLevels = new Views.SortLevels
			levels: @options.levels
			entryMetadataFields: @options.entryMetadataFields
		@$('header nav ul').prepend @subviews.sortLevels.$el

		@listenTo @subviews.sortLevels, 'change', (sortParameters) => @trigger 'change:sort-levels', sortParameters

	renderListItems: (responseModel) ->
		# On the first render, the response model is present in the @options.
		# On re-render, the response model is given as an argument.
		@options.responseModel = responseModel if responseModel?

		# Set the number of found entries to the header.
		@$('header h3.numfound').html "Found #{@options.responseModel.get('numFound')} #{config.get('entryTermPlural')}"

		@renderPagination()

		# Remove previously rendered list items.
		listItem.remove() for listItem in listItems

		@$("div.entries ul.page").remove()

		@renderListItemsPage @options.responseModel

	renderListItemsPage: (responseModel) ->
		pageNumber = @subviews.pagination.options.currentPage

		fulltext = responseModel.has('term') and responseModel.get('term').indexOf('*:*') is -1

		# Create a document fragment and append entry listitem views.
		frag = document.createDocumentFragment()
		for result in responseModel.get 'results'
			# Instantiate a new list item.
			entryListItem = new Views.EntryListItem
				entryData: result
				fulltext: fulltext

			# Listen to the click event, which bubbles up all the way to the faceted search, so it can pass
			# it to the parent view and trigger the router to navigate to the entry.
			@listenTo entryListItem, 'click', (id, terms, textLayer) -> @trigger 'navigate:entry', id, terms, textLayer
			@listenTo entryListItem, 'check', (id) -> @trigger 'check:entryListItem', id

			# Push every list item into the listItems array, so we can remove them on re-render.
			listItems.push entryListItem

			# Add the list item to the frag.
			frag.appendChild entryListItem.el

		# Add the frag to the dom.
		ul = $("<ul class=\"page\" data-page-number=\"#{pageNumber}\" />")
		ul.html frag

		@$("div.entries").append ul

	renderPagination: ->
		if @subviews.pagination?
			@stopListening @subviews.pagination
			@subviews.pagination.destroy()

		@subviews.pagination = new Views.Pagination
			start: @options.responseModel.get('start')
			rowCount: @options.resultRows
			resultCount: @options.responseModel.get('numFound')
		@listenTo @subviews.pagination, 'change:pagenumber', @changePage
		@$('header .pagination').html @subviews.pagination.el

	changePage: (pageNumber) ->
		entries = @$ 'div.entries'
		entries.find('ul.page').hide()

		if entries.find("ul.page[data-page-number=\"#{pageNumber}\"]").length > 0
			entries.find("ul.page[data-page-number=\"#{pageNumber}\"]").show()
		else
			@trigger 'change:pagination', pageNumber

	# ### Events
	events: ->
		'change li.show-metadata input': 'showMetadata'

	showMetadata: (ev) -> @$('.metadata').toggle ev.currentTarget.checked

module.exports = SearchResult