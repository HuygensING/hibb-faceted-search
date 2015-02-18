$ = require 'jquery'
_ = require 'underscore'

List = require './models/list'

ListOptions = require './collections/options'

FacetView = require '../main'
ListFacetOptions = require './options'

menuTpl = require './templates/menu.jade'

###
# @class
# @namespace Views
# @uses ListFacetOptions
# @uses ListOptions
# @uses List
###
class ListFacet extends FacetView

	###
	# @property
	# @type {String}
	###
	className: 'facet list'

	###
	# @method
	# @construct
	# @override FacetView::initialize
	# @param {Object} this.options
	###	
	initialize: (@options) ->
		super

		@resetActive = false

		@model = new List @options.attrs, parse: true

		facetData = @parseFacetData @options.attrs
		@collection = new ListOptions facetData.options, parse: true

		@render()

	###
	# @method
	# @override FacetView::render
	# @chainable
	# @return {ListFacet} Instance of ListFacet to enable chaining.
	###
	render: ->
		super

		if @$('header .options').length > 0
			menuTpl = @options.config.get('templates')['list.menu'] if @options.config.get('templates').hasOwnProperty 'list.menu'
			menu = menuTpl model: @model.attributes
			@$('header .options').html menu

		@optionsView = new ListFacetOptions
			collection: @collection
			facetName: @model.get 'name'
			config: @options.config

		@$('.body').html @optionsView.el

		@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
		# Pass through the change event
		@listenTo @optionsView, 'change', (data) => @trigger 'change', data

		@$('header i.openclose').hide() if @collection.length <= 3

		@

	###
	# @method
	# @override FacetView::postRender
	###
	postRender: ->
		el = @el.querySelector('.body > .container')

		if el.scrollHeight > el.clientHeight
			@$el.addClass 'with-scrollbar'

	###
	# Renders the count of the filtered options (ie: "3 of 8") next to the filter < input >
	#
	# @method
	###
	renderFilteredOptionCount: ->
		# filteredLength = @optionsView.filtered_items.length
		# collectionLength = @optionsView.collection.length
		visibleModels = @collection.filter (model) -> model.get('visible')
		value = if 0 < visibleModels.length < 21 then 'visible' else 'hidden'
		@$('input[type="checkbox"][name="all"]').css 'visibility', value

		filteredModels = @collection.filter (model) -> model.get('visible')

		if filteredModels.length is 0 or filteredModels.length is @collection.length
			@$('header .options input[name="filter"]').addClass 'nonefound'
			# @$('header small.optioncount').html ''
		else
			@$('header .options input[name="filter"]').removeClass 'nonefound'

		@$('header small.optioncount').html filteredModels.length + ' of ' + @collection.length

		@

	###
	# Extend the events of Facet with ListFacet events.
	#
	# @method
	# @override FacetView::events
	# @type {Object}
	# @return {Object}
	###
	events: -> _.extend {}, super,
		'keyup input[name="filter"]': (ev) -> @optionsView.filterOptions ev.currentTarget.value
		'change header .options input[type="checkbox"][name="all"]': (ev) -> @optionsView.setCheckboxes ev
		'click header .menu i.filter': '_toggleFilterMenu'
		'click header .menu i.alpha': '_changeOrder'
		'click header .menu i.amount': '_changeOrder'

	###
	# @method
	# @private
	###
	_toggleFilterMenu: ->
		optionsDiv = @$('header .options')
		filterIcon = @$('i.filter')
		filterIcon.toggleClass 'active'

		optionsDiv.slideToggle 150, =>
			input = optionsDiv.find('input[name="filter"]')

			if filterIcon.hasClass 'active'
				input.focus()
				@optionsView.appendOptions true
				@renderFilteredOptionCount()
			else
				input.val('')
				@collection.setAllVisible()

	###
	# @method
	# @private
	# @param {Object} ev The event object.
	###
	_changeOrder: (ev) ->
		# When changing the order, all the items must be active (set to visible).
		# Unless the filter menu is active, than we only change the order of the
		# filtered items.
		@optionsView.renderAll() unless @$('i.filter').hasClass 'active'

		$target = $(ev.currentTarget)

		if $target.hasClass 'active'
			if $target.hasClass 'alpha'
				$target.toggleClass 'fa-sort-alpha-desc'
				$target.toggleClass 'fa-sort-alpha-asc'
			else if $target.hasClass 'amount'
				$target.toggleClass 'fa-sort-amount-desc'
				$target.toggleClass 'fa-sort-amount-asc'
		else
			# Use amount and alpha in selectors, because otherwise an active
			# filter would also be removed
			@$('i.amount.active').removeClass 'active'
			@$('i.alpha.active').removeClass 'active'
			$target.addClass 'active'

		type = if $target.hasClass 'alpha' then 'alpha' else 'amount'
		order = if $target.hasClass 'fa-sort-'+type+'-desc' then 'desc' else 'asc'

		@collection.orderBy type+'_'+order

	###
	# @method
	# @override FacetView::update
	# @param {Object} newOptions
	###
	update: (newOptions) ->
		if @resetActive
			# Pass newOptions through parsers
			# Dirty implementation untill @reset is fixed!
			facetData = @parseFacetData
				options: newOptions
				name: @options.attrs.name

			@collection.reset facetData.options, parse: true
			@resetActive = false
		else
			@collection.update(newOptions)

	###
	# @method
	# @override FacetView::reset
	###
	reset: ->
		@resetActive = true

		@_toggleFilterMenu() if @$('i.filter').hasClass 'active'

	###
	# Alias for reset, but used for different implementation. This should be the base
	# of the original reset, but no time for proper refactor.
	#
	# @method
	# @todo refactor @reset.
	###
	revert: ->
		@_toggleFilterMenu() if @$('i.filter').hasClass 'active'
		
		@collection.revert()
		@collection.sort()

module.exports = ListFacet
