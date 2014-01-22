define (require) ->

	Fn = require 'hilib/functions/general'

	Views = 
		Base: require 'hilib/views/base'

	Models =
		List: require 'models/list'

	# Templates =
	# 	Options: require 'text!html/facet/list.options.html'
	tpls = require 'tpls'
	

	class ListFacetOptions extends Views.Base

		className: 'container'

		events: ->
			'click i': 'checkChanged'
			'click label': 'checkChanged'
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
			$target = if ev.currentTarget.tagName is 'LABEL' then @$ 'i[data-value="'+ev.currentTarget.getAttribute('data-value')+'"]' else $ ev.currentTarget

			$target.toggleClass 'fa-square-o'
			$target.toggleClass 'fa-check-square-o'

			id = $target.attr 'data-value'
			@collection.get(id).set 'checked', $target.hasClass 'fa-check-square-o'

			
			if @$('i.fa-check-square-o').length is 0 then @triggerChange() else Fn.timeoutWithReset 1000, => @triggerChange()

		triggerChange: =>
			@trigger 'change',
				facetValue:
					name: @options.facetName
					values: _.map @$('i.fa-check-square-o'), (cb) -> cb.getAttribute 'data-value'

		initialize: ->
			super

			@showing = null
			@showingIncrement = 50
			@filtered_items = @collection.models

			@listenTo @collection, 'sort', =>
				@filtered_items = @collection.models
				@render()
			# @listenTo @collection, 'change', =>
				# console.log 'change'
				# @filtered_items = @collection.models
				# @render()

			@render()

		render: ->
			@showing = 50

			ul = document.createElement 'ul'

			# Set the height of the <ul> dynamically, to prevent glitches
			# when the options are rendered on scrolling.
			ul.style.height =  (@filtered_items.length * 15) + 'px'

			@el.innerHTML = ''
			@el.appendChild ul

			@appendOptions()

			@

		# Unused, but could be handy in the future.
		renderAll: ->
			@render()
			@appendAllOptions()

		appendOptions: ->
			tpl = ''
			for option in @filtered_items[@showing-@showingIncrement..@showing]
				tpl += tpls['faceted-search/facets/list.option'] 
					option: option

			@$('ul').append tpl

		# Unused, but could be handy in the future.
		appendAllOptions: ->
			tpl = ''
			for option in @filtered_items[@showing..]
				tpl += tpls['faceted-search/facets/list.option'] 
					option: option

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

		setCheckboxes: (ev) ->
			model.set 'checked', ev.currentTarget.checked for model in @collection.models
			@render()
			@triggerChange()

			# @selectAll = not @selectAll

			# checkboxes = @el.querySelectorAll('.body i.fa')
			# for cb in checkboxes
			# 	$cb = $ cb

			# 	if @selectAll
			# 		$cb.removeClass 'fa-square-o'
			# 		$cb.addClass 'fa-check-square-o' 
			# 	else 
			# 		$cb.removeClass 'fa-check-square-o'
			# 		$cb.addClass 'fa-square-o'
