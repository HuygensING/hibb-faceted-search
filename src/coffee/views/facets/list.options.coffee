Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

Fn = require 'hilib/src/utils/general'

config = require '../../config'

Models =
	List: require '../../models/list'

bodyTpl = require '../../../jade/facets/list.body.jade'
optionTpl = require '../../../jade/facets/list.option.jade'

class ListFacetOptions extends Backbone.View

	className: 'container'

	# ### Initialize
	initialize: (@options) ->
		@showingCursor = 0
		@showingIncrement = 50

		@listenTo @collection, 'sort', => @rerender()

		optionTpl = config.templates['list.option'] if config.templates.hasOwnProperty 'list.option'

		@render()

	# ### Render
	render: ->
		bodyTpl = config.templates['list.body'] if config.templates.hasOwnProperty 'list.body'
		@$el.html bodyTpl facetName: @options.facetName

		# Set the height of the <ul> dynamically, to prevent glitches
		# when the options are rendered on scrolling.
		# ul.style.height =  (@filtered_items.length * 15) + 'px'

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

		while @showingCursor < @showingIncrement and @showingCursor < @collection.length
			model = @collection.at(@showingCursor)
			model.set 'visible', true
			tpl += optionTpl option: model
			@showingCursor = @showingCursor + 1

		@$('ul').append tpl

	# Unused, but could be handy in the future.
	renderAll: ->
		@appendOptions true


	# ### Events
	events: ->
		'click li': 'checkChanged'
		# 'click label': 'checkChanged'
		'scroll': 'onScroll'

	# When scolling lazy render the rest of the options. This speeds up page load.
	onScroll: (ev) ->
		if @showingCursor < @collection.length
			target = ev.currentTarget
			topPerc = target.scrollTop / target.scrollHeight

			if topPerc > (@showingCursor/2)/@collection.length
				@showingIncrement += @showingIncrement
				@appendOptions()

	checkChanged: (ev) ->
		# $target = if ev.currentTarget.tagName is 'LABEL' then @$ 'i[data-value="'+ev.currentTarget.getAttribute('data-value')+'"]' else $ ev.currentTarget
		$target = $ ev.currentTarget
		id = $target.attr 'data-value'

		$target.find("i.checked").toggle()
		$target.find("i.unchecked").toggle()

		@collection.get(id).set 'checked', $target.find("i.checked").is(':visible')

		# If there are no checked options or autoSearch is off (false), than triggerChange,
		# otherwise (autoSearch is true and there are options checked), set a 1s timeout to
		# give the user time to check another option before autoSearch kicks in.
		if @$('i.checked').length is 0 or not config.autoSearch
			@triggerChange()
		else
			Fn.timeoutWithReset 1000, => @triggerChange()

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