$ = require 'jquery'
_ = require 'underscore'

config = require '../../config'

Fn = require 'hilib/src/utils/general'

Models =
	List: require '../../models/list'

Collections = 
	Options: require '../../collections/list.options'

Views = 
	Facet: require './main'
	Options: require './list.options'

menuTpl = require '../../../jade/facets/list.menu.jade'

class ListFacet extends Views.Facet

	# checked: []

	# filtered_items: []

	className: 'facet list'

	initialize: (@options) ->
		super

		@model = new Models.List @options.attrs, parse: true
		@collection = new Collections.Options @options.attrs.options, parse: true
		
		@render()

	# ### Render
	render: ->
		super

		if @$('header .options').length > 0
			menuTpl = config.templates['list.menu'] if config.templates.hasOwnProperty 'list.menu'
			menu = menuTpl model: @model.attributes
			@$('header .options').html menu

		@optionsView = new Views.Options
			collection: @collection
			facetName: @model.get 'name'

		@$('.body').html @optionsView.el

		@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
		# Pass through the change event
		@listenTo @optionsView, 'change', (data) => @trigger 'change', data

		@$('header i.openclose').hide() if @collection.length <= 3

		@

	# Renders the count of the filtered options (ie: "3 of 8") next to the filter <input>
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

	# ### Events
	events: -> _.extend {}, super,
		'keyup input[name="filter"]': (ev) -> @optionsView.filterOptions ev.currentTarget.value
		'change header .options input[type="checkbox"][name="all"]': (ev) -> @optionsView.setCheckboxes ev
		'click header .menu i.filter': 'toggleFilterMenu'
		'click header .menu i.alpha': 'changeOrder'
		'click header .menu i.amount': 'changeOrder'

	toggleFilterMenu: ->
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

	# We use the class opposite instead of ascending/descending, because the options are ascending and
	# and the count is descending. With opposite we can use a generic name.
	changeOrder: (ev) ->
		$target = $(ev.currentTarget)

		if $target.hasClass 'active'
			if $target.hasClass 'alpha'
				$target.toggleClass 'fa-sort-alpha-desc'
				$target.toggleClass 'fa-sort-alpha-asc'
			else if $target.hasClass 'amount'
				$target.toggleClass 'fa-sort-amount-desc'
				$target.toggleClass 'fa-sort-amount-asc'
		else
			@$('.active').removeClass 'active'
			$target.addClass 'active'

		type = if $target.hasClass 'alpha' then 'alpha' else 'amount'
		order = if $target.hasClass 'fa-sort-'+type+'-desc' then 'desc' else 'asc'

		@collection.orderBy type+'_'+order

	update: (newOptions) -> @collection.updateOptions(newOptions)
	reset: -> @collection.revert()

module.exports = ListFacet