define (require) ->

	Fn = require 'helpers/fns'

	Views = 
		Facet: require 'views/facet'

	Models =
		List: require 'models/list'

	Templates =
		List: require 'text!html/facet/list.html'
		Items: require 'text!html/facet/list.items.html'

	class ListFacet extends Views.Facet

		filtered_items: []

		className: 'facet list'

		events: ->
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'click h3': 'toggleBody'
			'keyup input.listsearch': 'showResults'
			'change input[type="checkbox"]': 'checkChanged'

		toggleBody: (ev) ->
			console.log $(ev.currentTarget).parents('.list')
			$(ev.currentTarget).parents('.list').find('.body').slideToggle()


		selectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = true for cb in checkboxes

		deselectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = false for cb in checkboxes

		showResults: (ev) ->
			value = ev.currentTarget.value
			re = new RegExp value, 'i'
			@filtered_items = @model.get('options').filter (item) ->
				re.test item.get('name')
			@renderListItems()

		checkChanged: (ev) ->
			checked = @el.querySelectorAll('input[type="checkbox"]:checked')
			values = []
			values.push c.getAttribute 'data-value' for c in checked # Is looping over all checked more efficient than toggling value in array?

			@publish 'facet:list:changed',
				name: @model.get 'name'
				values: values

		initialize: (options) ->
			super

			@model = new Models.List options.attrs, parse: true

			@render()

		render: ->
			super

			rtpl = _.template Templates.List, @model.attributes
			@$('.placeholder').html rtpl

			@renderListItems()

			@

		renderListItems: ->
			items = if @filtered_items.length > 0 then @filtered_items else @model.get('options').models

			rtpl = _.template Templates.Items, 
				model: @model.attributes
				items: items
				generateID: Fn.generateID

			@$('.body .items ul').html rtpl