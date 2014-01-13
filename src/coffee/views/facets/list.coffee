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

		# checked: []

		# filtered_items: []

		className: 'facet list'

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
				collection: @collection
				facetName: @model.get 'name'

			@$('.body').html @optionsView.el

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

		events: -> _.extend {}, super,
			'keyup input[name="filter"]': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			'change header .options input[type="checkbox"][name="all"]': (ev) -> @optionsView.setCheckboxes ev
			'click .orderby i': 'changeOrder'

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

		update: (newOptions) -> @optionsView.collection.updateOptions(newOptions)
		reset: -> @optionsView.collection.revert()