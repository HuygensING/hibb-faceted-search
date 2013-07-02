define (require) ->

	Fn = require 'helpers/fns'

	Views = 
		Facet: require 'modules/faceted-search/views/facet'

	Models =
		List: require 'modules/faceted-search/models/list'

	Collections = 
		Facets: require 'modules/faceted-search/collections/facets'

	Templates =
		List: require 'text!html/modules/faceted-search/facet/list.html'
		Items: require 'text!html/modules/faceted-search/facet/list.items.html'

	class ListFacet extends Views.Facet

		filtered_items: []

		className: 'facet list'

		events: ->
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'click h3': 'toggleBody'
			'keyup input.listsearch': 'showResults'

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

			@$('.body ul.items').html rtpl

