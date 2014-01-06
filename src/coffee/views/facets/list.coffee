define (require) ->

	Fn = require 'hilib/functions/general'

	Models =
		List: require 'models/list'

	Collections = 
		Options: require 'collections/list.options'

	Views = 
		Facet: require 'views/facets/main'
		Options: require 'views/facets/list.options'

	# Templates =
	# 	Menu: require 'text!html/facet/list.menu.html'
	# 	Body: require 'text!html/facet/list.body.html'
	tpls = require 'tpls'

	class ListFacet extends Views.Facet

		checked: []

		filtered_items: []

		className: 'facet list'

		events: -> _.extend {}, super,
			'keyup input[name="filter"]': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			'change header .options input[type="checkbox"][name="all"]': 'selectAll'
			'click .orderby span': 'changeOrder'

		# We use the class opposite instead of ascending/descending, because the options are ascending and
		# and the count is descending. With opposite we can use a generic name.
		changeOrder: (ev) ->
			$target = $(ev.currentTarget)

			if $target.hasClass 'active'
				$target.toggleClass 'opposite'
			else
				@$('.orderby span.active').removeClass 'active opposite'
				$target.addClass 'active'

			strategy = if $target.hasClass 'name' then 'name' else 'count'
			strategy += '_opposite'  if $target.hasClass 'opposite'

			@collection.orderBy strategy

		selectAll: (ev) ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = ev.currentTarget.checked for cb in checkboxes

		initialize: (@options) ->
			super

			@model = new Models.List @options.attrs, parse: true
			
			@render()

		render: ->
			super

			menu = tpls['faceted-search/facets/list.menu'] @model.attributes
			body = tpls['faceted-search/facets/list.body'] @model.attributes

			@el.querySelector('header .options').innerHTML = menu
			@el.querySelector('.body').innerHTML = body

			@collection = new Collections.Options @options.attrs.options, parse: true
			@optionsView = new Views.Options
				el: @el.querySelector('.body')
				collection: @collection
				facetName: @model.get 'name'

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			# Pass through the change event
			@listenTo @optionsView, 'change', (data) => @trigger 'change', data

			@

		# Renders the count of the filtered options (ie: "3 of 8") next to the filter <input>
		renderFilteredOptionCount: ->
			filteredLength = @optionsView.filtered_items.length
			collectionLength = @optionsView.collection.length

			if filteredLength is 0 or filteredLength is collectionLength
				@$('header .options input[name="filter"]').addClass 'nonefound'
				@$('header small.optioncount').html ''
			else
				@$('header .options input[name="filter"]').removeClass 'nonefound'
				@$('header small.optioncount').html filteredLength + ' of ' + collectionLength

			@

		update: (newOptions) -> @optionsView.collection.updateOptions(newOptions)
		reset: -> @optionsView.collection.revert()