define (require) ->

	Fn = require 'helpers/general'

	Views = 
		Base: require 'views/base'

	Models =
		List: require 'models/list'

	Templates =
		List: require 'text!html/facet/list.html'
		Options: require 'text!html/facet/list.options.html'

	class ListOptions extends Views.Base

		filtered_items: []

		events: ->
			'change input[type="checkbox"]': 'checkChanged'

		checkChanged: (ev) ->
			id = ev.currentTarget.getAttribute 'data-value'
			@collection.get(id).set 'checked', ev.currentTarget.checked

			@trigger 'change',
				facetValue:
					name: @options.facetName
					values: _.map @$('input:checked'), (input) -> input.getAttribute 'data-value'

		initialize: ->
			super

			@listenTo @collection, 'sort', @render

			@render()

		render: ->
			options = if @filtered_items.length > 0 then @filtered_items else @collection.models

			rtpl = _.template Templates.Options, 
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
