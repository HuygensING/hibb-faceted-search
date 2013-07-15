define (require) ->

	Fn = require 'helpers/fns'

	Models =
		query: require 'models/query'
		List: require 'models/list'

	Collections = 
		Options: require 'collections/list.options'

	Views = 
		Facet: require 'views/facet'
		Options: require 'views/facets/list.options'

	Templates =
		List: require 'text!html/facet/list.html'
		# Items: require 'text!html/facet/list.options.html'

	class ListFacet extends Views.Facet

		checked: []

		filtered_items: []

		className: 'facet list'

		events: ->
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'click h3': 'toggleBody'
			'keyup input.listsearch': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			# 'change input[type="checkbox"]': 'checkChanged'

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.list').find('.body').slideToggle()

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
			data = @model.attributes
			data = _.extend data, 'generateID': ->
			rtpl = _.template Templates.List, data
			@$('.placeholder').html rtpl

			@optionsView = new Views.Options
				el: @$('.items')
				collection: @collection

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			@listenTo @collection, 'change:checked', @optionChecked

		optionChecked: ->
			checked = []
			@optionsView.collection.each (model) -> checked.push model.id if model.get 'checked'

			@publish 'facet:list:changed',
				name: @model.get 'name'
				values: checked

		renderFilteredOptionCount: ->
			filteredLength = @optionsView.filtered_items.length
			collectionLength = @optionsView.collection.length

			if filteredLength is 0 or filteredLength is collectionLength
				@$('header small').html ''
			else
				@$('header small').html filteredLength + ' of ' + collectionLength

			@

		update: (newOptions) -> @optionsView.collection.updateOptions(newOptions)