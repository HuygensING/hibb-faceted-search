define (require) ->

	Models =
		List: require 'models/list'

	Collections = 
		Options: require 'collections/list.options'

	Views = 
		Facet: require 'views/facet'
		Options: require 'views/facets/list.options'

	Templates =
		List: require 'text!html/facet/list.html'

	class ListFacet extends Views.Facet

		checked: []

		filtered_items: []

		className: 'facet list'

		events: ->
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'click h3': 'toggleBody'
			'keyup input.listsearch': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			'click header small': 'toggleOptions'


		toggleOptions: (ev) ->
			@$('header .options').slideToggle()
			@$('.options .listsearch').focus()

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		selectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = true for cb in checkboxes

		deselectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = false for cb in checkboxes

		initialize: (options) ->
			super

			@model = new Models.List options.attrs
			@collection = new Collections.Options options.attrs.options, parse: true

			@render()

		render: ->
			super

			rtpl = _.template Templates.List, @model.attributes
			@$('.placeholder').html rtpl

			@optionsView = new Views.Options
				el: @$('.body .options')
				collection: @collection
				facetName: @model.get 'name'

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			@listenTo @optionsView, 'change', (data) => @trigger 'change', data # Trigger optionsView change event on this object

			@

		# Renders the count of the filtered options next to the facets title
		renderFilteredOptionCount: ->
			filteredLength = @optionsView.filtered_items.length
			collectionLength = @optionsView.collection.length

			if filteredLength is 0 or filteredLength is collectionLength
				@$('header .options .listsearch').addClass 'nonefound'
				@$('header small.optioncount').html ''
			else
				@$('header .options .listsearch').removeClass 'nonefound'
				@$('header small.optioncount').html filteredLength + ' of ' + collectionLength

			@

		update: (newOptions) -> @optionsView.collection.updateOptions(newOptions)