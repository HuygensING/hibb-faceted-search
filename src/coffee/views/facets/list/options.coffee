Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

funcky = require('funcky.util')

bodyTpl = require './templates/body.jade'
optionTpl = require './templates/option.jade'

###
# @class
# @namespace Views
###
class ListFacetOptions extends Backbone.View

	###
	# @property
	# @type {String}
	###
	className: 'container'

	###
	# @method
	# @construct
	###
	initialize: (options) ->
		@config = options.config
		@facetName = options.facetName
		
		@listenTo @collection, 'sort', =>
			@rerender()
		@listenTo @collection, 'reset', =>			
			@collection.orderBy 'count_desc', true
			@render()

		optionTpl = @config.get('templates')['list.option'] if @config.get('templates').hasOwnProperty 'list.option'

		@render()

	###
	# @method
	# @chainable
	# @return {ListFacetOptions}
	###
	render: ->
		# Define in @render, so they are being reset when the collection is reset and view (re)rendered.
		@showingCursor = 0
		@showingIncrement = 50

		bodyTpl = @config.get('templates')['list.body'] if @config.get('templates').hasOwnProperty 'list.body'
		@$el.html bodyTpl facetName: @facetName

		# Set the height of the <ul> dynamically, to prevent glitches
		# when the options are rendered on scrolling.
		# ul.style.height =  (@filtered_items.length * 15) + 'px'

		@appendOptions()

		@

	###
	# @method
	###
	rerender: ->
		tpl = ""

		i = 0
		model = @collection.at(i)
		visible = model.get('visible')

		while visible
			tpl += optionTpl option: model

			i = i + 1

			model = @collection.at(i)
			visible = if model? and model.get('visible') then true else false

		@$('ul').html tpl

	###
	# @method
	# @param {Boolean} all
	###
	appendOptions: (all=false) ->
		return if @$('ul > li').length is @collection.length

		# If true is passed as argument, all options are added.
		@showingIncrement = @collection.length if all

		tpl = ''

		while @showingCursor < @showingIncrement and @showingCursor < @collection.length
			model = @collection.at(@showingCursor)
			model.set 'visible', true
			tpl += optionTpl option: model
			@showingCursor = @showingCursor + 1

		@$('ul').append tpl

	###
	# When all models are set to visible, the collection is sorted and
	# this.rerender is called.
	#
	# @method
	###
	renderAll: ->
		@collection.setAllVisible()

	###
	# @method
	# @return {Object} Hash of events.
	###
	events: ->
		'click li': 'checkChanged'
		# 'click label': 'checkChanged'
		'scroll': 'onScroll'
	###
	# When scolling lazy render the rest of the options. This speeds up page load.
	#
	# @method
	# @param {Object} ev
	###
	onScroll: (ev) ->
		if @showingCursor < @collection.length
			target = ev.currentTarget
			topPerc = target.scrollTop / target.scrollHeight

			if topPerc > (@showingCursor/2)/@collection.length
				@showingIncrement += @showingIncrement
				@appendOptions()
	###
	# @method
	###
	checkChanged: (ev) ->
		# $target = if ev.currentTarget.tagName is 'LABEL' then @$ 'i[data-value="'+ev.currentTarget.getAttribute('data-value')+'"]' else $ ev.currentTarget
		$target = $ ev.currentTarget
		id = $target.attr 'data-value'

		$target.toggleClass 'checked'
		# checked = $target.find("i.checked")
		# unchecked = $target.find("i.unchecked")

		# # Don't use $.toggle, because it will toggle the <i> set to display:none
		# # to display: inline, instead of inline-block.
		# if checked.is(':visible')
		# 	checked.hide()
		# 	unchecked.css 'display', 'inline-block'
		# else
		# 	checked.css 'display', 'inline-block'
		# 	unchecked.hide()

		@collection.get(id).set 'checked', $target.hasClass 'checked'

		# If there are no checked options or autoSearch is off (false), than triggerChange,
		# otherwise (autoSearch is true and there are options checked), set a 1s timeout to
		# give the user time to check another option before autoSearch kicks in.
		if @$('li.checked').length is 0 or not @config.get('autoSearch')
			@triggerChange()
		else
			funcky.setResetTimeout 1000, => @triggerChange()

	###
	# @method
	# @param {Array<Object>} values
	###
	triggerChange: (values) =>
		unless values?
			checkedModels = @collection.filter (item) -> item.get 'checked'
			values = _.map checkedModels, (item) -> item.get('name')

		@trigger 'change',
			facetValue:
				name: @facetName
				values: values

	# ### Methods

	###
	# Called by parent (ListFacet) when user types in the search input
	#
	# @method
	# @param {String} value Query to filter results on.
	###
	filterOptions: (value) ->
		@collection.map (model) ->
			re = new RegExp value, 'i'
			model.set 'visible', re.test model.id
		# @filtered_items = @collection.models if @filtered_items.length is 0

		@collection.sort()
		@trigger 'filter:finished'

		# @render()

	###
	# @method
	# @param {Object} ev
	###
	setCheckboxes: (ev) ->
		visibleModels = @collection.filter (model) -> model.get 'visible'
		model.set 'checked', ev.currentTarget.checked for model in visibleModels


		if ev.currentTarget.checked
			values = _.map visibleModels, (item) -> item.get('name')
			@triggerChange values
		else
			@triggerChange()

# @triggerChange will send the new values to the server and call @rerender.

module.exports = ListFacetOptions