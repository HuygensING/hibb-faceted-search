define (require) ->

	Fn = require 'helpers/fns'

	Views = 
		Base: require 'views/base'

	Models =
		query: require 'models/query'
		List: require 'models/list'

	Templates =
		List: require 'text!html/facet/list.html'
		Items: require 'text!html/facet/list.options.html'

	class ListOptions extends Views.Base

		filtered_items: []

		events: ->
			'change input[type="checkbox"]': 'checkChanged'

		checkChanged: (ev) ->
			value = ev.currentTarget.getAttribute 'data-value'
			model = @collection.get value
			model.set 'checked', true

		initialize: ->
			super

			@listenTo @collection, 'sort', @render

			@render()

		render: ->
			options = if @filtered_items.length > 0 then @filtered_items else @collection.models

			rtpl = _.template Templates.Items, 
				options: options
				generateID: Fn.generateID

			@$el.html rtpl
		
		###
		Called by parent (ListFacet) when user types in the search input
		###
		filterOptions: (value) ->
			re = new RegExp value, 'i'
			@filtered_items = @collection.filter (item) -> re.test item.id

			@trigger 'filter:finished'

			@render()
