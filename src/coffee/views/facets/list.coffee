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
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'keyup input[name="filter"]': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			# 'click h3': 'toggleBody'
			# 'click header small': 'toggleOptions'


		# toggleOptions: (ev) ->
		# 	@$('header small').toggleClass('active')
		# 	@$('header .options').slideToggle()
		# 	@$('.options .listsearch').focus()

		# toggleBody: (ev) ->
		# 	$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		selectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = true for cb in checkboxes

		deselectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = false for cb in checkboxes

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

			options = new Collections.Options @options.attrs.options, parse: true
			@optionsView = new Views.Options
				el: @el.querySelector('.body ul')
				collection: options
				facetName: @model.get 'name'

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			# Trigger optionsView change event on this object
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