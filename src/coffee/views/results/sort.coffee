Backbone = require 'backbone'
$ = require 'jquery'

el = require('funcky.el').el

tpl = require './sort.jade'

###
# Input element to set the sorting levels. There are three levels and every
# level can be set ascending or descending.
# 
# @class
# @namespace Views
# @uses Config
###
class SortLevels extends Backbone.View
	###
	# @property
	# @type {String}
	###
	tagName: 'li'

	###
	# @property
	# @type {String}
	###
	className: 'sort-levels'

	###
	# @param {Object} this.options
	# @param {Config} this.options.config
	###
	initialize: (@options) ->
		@render()

		@listenTo @options.config, 'change:initLevels', @render
		# @listenTo @options.config, 'change:levels', =>
		# 	console.log 'change:levels'
		# 	console.log arguments
		# @listenTo @options.config, 'change:levels', (model, sortLevels) =>
		# 	sortParameters = []

		# 	for level in sortLevels
		# 		sortParameters.push fieldname: level, direction: 'asc'
	
		# 	@trigger 'change', sortParameters

		# 	@render()

	###
	# @method
	# @chainable
	# @return {SortLevels}
	###
	render: ->
		if Object.keys(@options.config.get('initLevels')).length > 0
			rtpl = tpl
				initLevels: @options.config.get('initLevels')
				levels: @options.config.get('levels')
			@$el.html rtpl


			levels = @$('div.levels')
			leave = (ev) ->
				# The leave event is triggered when the user clicks the <select>,
				# so we check if the target isn't part of div.levels
				levels.hide() unless el(levels[0]).hasDescendant(ev.target) or levels[0] is ev.target
			@onMouseleave = leave.bind(@)
			levels.on 'mouseleave', @onMouseleave

		@

	###
	# @method
	# @return {Object}
	###
	events: ->
		'click button.toggle': 'toggleLevels'
		'click li.search button': 'saveLevels'
		'change div.levels select': 'changeLevels'
		'click div.levels i.fa': 'changeAlphaSort'

	###
	# @method
	###
	toggleLevels: (ev) ->
		@$('div.levels').toggle()

	###
	# @method
	###
	hideLevels: ->
		@$('div.levels').hide()

	###
	# @method
	###
	changeLevels: (ev) ->
		@$('div.levels').addClass 'show-save-button'

		target = ev.currentTarget

		# Loop the selects.
		for select in @el.querySelectorAll 'div.levels select'
			# Set a select to empty if it has the same value as the user has selected.
			select.selectedIndex = 0 if select.name isnt target.name and select.value is target.value

		# Reset all selects to ascending.
		for i in @el.querySelectorAll 'div.levels i.fa'
			$target = @$(i)
			$target.addClass 'fa-sort-alpha-asc'
			$target.removeClass 'fa-sort-alpha-desc'

	###
	# @method
	###
	changeAlphaSort: (ev) ->
		@$('div.levels').addClass 'show-save-button'

		$target = @$(ev.currentTarget)
		$target.toggleClass 'fa-sort-alpha-asc'
		$target.toggleClass 'fa-sort-alpha-desc'

	###
	# @method
	###
	saveLevels: ->
		sortParameters = []

		for li in @el.querySelectorAll 'div.levels li[name]'
			select = li.querySelector('select')
			fieldName = select.options[select.selectedIndex].value

			if fieldName isnt ""
				sortParameter = {}
				sortParameter.fieldname = fieldName
				sortParameter.direction = if $(li).find('i.fa').hasClass 'fa-sort-alpha-asc' then 'asc' else 'desc'

				sortParameters.push sortParameter

		@hideLevels()

		@trigger 'change', sortParameters

	###
	# @method
	###
	destroy: ->
		@$('div.levels').off 'mouseleave', @onMouseleave
		@remove()

module.exports = SortLevels