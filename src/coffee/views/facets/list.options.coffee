Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

Fn = require 'hilib/src/utils/general'

Models =
	List: require '../../models/list'

optionTpl = require '../../../jade/facets/list.option.jade'

class ListFacetOptions extends Backbone.View

	className: 'container'

	# ### Initialize
	initialize: ->
		@showingCursor = 0
		@showingIncrement = 50


		@listenTo @collection, 'sort', => @rerender()

		@render()

	# ### Render
	render: ->
		ul = document.createElement 'ul'

		# Set the height of the <ul> dynamically, to prevent glitches
		# when the options are rendered on scrolling.
		# ul.style.height =  (@filtered_items.length * 15) + 'px'

		@$el.html ul

		@appendOptions()

		@

	rerender: ->
		tpl = ''

		i = 0
		model = @collection.at(i)
		visible = model.get('visible')
		while visible
			tpl += optionTpl option: model
			i = i + 1
			model = @collection.at(i)
			visible = if model? and model.get('visible') then true else false

		@$('ul').html tpl

	appendOptions: (all=false) ->
		# If true is passed as argument, all options are added.
		@showingIncrement = @collection.length if all

		tpl = ''

		console.log @showingIncrement
		while @showingCursor < @showingIncrement and @showingCursor < @collection.length
			model = @collection.at(@showingCursor)
			model.set 'visible', true
			tpl += optionTpl option: model
			@showingCursor = @showingCursor + 1

		@$('ul').append tpl

	# Unused, but could be handy in the future.
	renderAll: ->
		@render()
		@appendAll()

	# # Unused, but could be handy in the future.
	# appendAll: ->
	# 	tpl = ''
	# 	while @showingCursor < @collection.length
	# 		model = @collection.at(@showingCursor)
	# 		model.set 'visible', true
	# 		tpl += optionTpl option: model
	# 		@showingCursor = @showingCursor + 1

	# 	@$('ul').append tpl

	# ### Events
	events: ->
		'click i': 'checkChanged'
		'click label': 'checkChanged'
		'scroll': 'onScroll'

	onScroll: (ev) ->
		if @showingCursor < @collection.length
			target = ev.currentTarget
			topPerc = target.scrollTop / target.scrollHeight

			if topPerc > (@showingCursor/2)/@collection.length
				@showingIncrement += @showingIncrement
				@appendOptions()

	checkChanged: (ev) ->
		$target = if ev.currentTarget.tagName is 'LABEL' then @$ 'i[data-value="'+ev.currentTarget.getAttribute('data-value')+'"]' else $ ev.currentTarget

		$target.toggleClass 'fa-square-o'
		$target.toggleClass 'fa-check-square-o'

		id = $target.attr 'data-value'
		@collection.get(id).set 'checked', $target.hasClass 'fa-check-square-o'

		
		if @$('i.fa-check-square-o').length is 0 then @triggerChange() else Fn.timeoutWithReset 1000, => @triggerChange()

	triggerChange: (values) =>
		unless values?
			checkedModels = @collection.filter (item) -> item.get 'checked'
			values = _.map checkedModels, (item) -> item.get('name')

		@trigger 'change',
			facetValue:
				name: @options.facetName
				values: values

	# ### Methods
	
	###
	Called by parent (ListFacet) when user types in the search input
	###
	filterOptions: (value) ->
		@collection.map (model) -> 
			re = new RegExp value, 'i'
			model.set 'visible', re.test model.id
		# @filtered_items = @collection.models if @filtered_items.length is 0

		@collection.sort()
		@trigger 'filter:finished'

		# @render()

	setCheckboxes: (ev) ->
		visibleModels = @collection.filter (model) -> model.get 'visible'
		model.set 'checked', ev.currentTarget.checked for model in visibleModels

		values = _.map visibleModels, (item) -> item.get('name')

		# Call @render so the checked and/or unchecked checkboxes show up.
		# @render()

		# @triggerChange will send the new values to the server and call @render again.
		@triggerChange values

module.exports = ListFacetOptions