define (require) ->

	Fn = require 'hilib/functions/general'

	Views = 
		Base: require 'views/base'

	Models =
		List: require 'models/list'

	# Templates =
	# 	Options: require 'text!html/facet/list.options.html'
	tpls = require 'tpls'
	

	class ListFacetOptions extends Views.Base

		className: 'container'

		events: ->
			'change input[type="checkbox"]': 'checkChanged'
			'scroll': 'onScroll'

		onScroll: (ev) ->
			target = ev.currentTarget
			topPerc = target.scrollTop / target.scrollHeight

			if topPerc > (@showing/2)/@collection.length && @showing < @collection.length
				@showing += @showingIncrement
				@showing = @collection.length if @showing > @collection.length
				# console.log @showing
				@appendOptions()

		checkChanged: (ev) ->
			id = ev.currentTarget.getAttribute 'data-value'
			@collection.get(id).set 'checked', ev.currentTarget.checked

			@trigger 'change',
				facetValue:
					name: @options.facetName
					values: _.map @$('input:checked'), (input) -> input.getAttribute 'data-value'

		initialize: ->
			super

			@showing = null
			@showingIncrement = 50
			@filtered_items = @collection.models

			@listenTo @collection, 'sort', =>
				@filtered_items = @collection.models
				@render()
			@listenTo @collection, 'change', =>
				@filtered_items = @collection.models
				@render()

			@render()

		render: ->
			@showing = 50

			ul = document.createElement 'ul'
			ul.style.height =  (@filtered_items.length * 15) + 'px'

			@el.innerHTML = ''
			@el.appendChild ul

			@appendOptions()

			@

		appendOptions: ->
			tpl = ''
			for option in @filtered_items[@showing-@showingIncrement..@showing]
				tpl += tpls['faceted-search/facets/list.option'] 
					option: option
					randomId: Fn.generateID()

			@$('ul').append tpl


		
		###
		Called by parent (ListFacet) when user types in the search input
		###
		filterOptions: (value) ->
			re = new RegExp value, 'i'
			@filtered_items = @collection.filter (item) -> re.test item.id
			@filtered_items = @collection.models if @filtered_items.length is 0

			@trigger 'filter:finished'

			@render()
