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
		@showing = null
		@showingIncrement = 50
		@filtered_items = @collection.models

		@listenTo @collection, 'sort', =>
			@filtered_items = @collection.models
			@render()

		@render()

	# ### Render
	render: ->
		@showing = 50

		ul = document.createElement 'ul'

		# Set the height of the <ul> dynamically, to prevent glitches
		# when the options are rendered on scrolling.
		# ul.style.height =  (@filtered_items.length * 15) + 'px'

		@$el.html ul

		@appendOptions()

		@

	# Unused, but could be handy in the future.
	renderAll: ->
		@render()
		@appendAllOptions()

	appendOptions: ->
		tpl = ''
		for option in @filtered_items[@showing-@showingIncrement..@showing]
			tpl += optionTpl option: option

		@$('ul').append tpl

	# Unused, but could be handy in the future.
	appendAllOptions: ->
		tpl = ''
		for option in @filtered_items[@showing..]
			tpl += tpl option: option

		@$('ul').append tpl

	# ### Events
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
		filtered = _.filter @filtered_items, (item) -> item.get 'checked'
		values = _.map filtered, (item) -> item.get('name')

		@trigger 'change',
			facetValue:
				name: @options.facetName
				values: values

	# ### Methods
	
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
		model.set 'checked', ev.currentTarget.checked for model in @filtered_items

		# Call @render so the checked and/or unchecked checkboxes show up.
		@render()

		# @triggerChange will send the new values to the server and call @render again.
		@triggerChange()

module.exports = ListFacetOptions