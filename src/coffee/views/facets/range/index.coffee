$ = require 'jquery'
_ = require 'underscore'

Range = require './model'
MonthRange = require './month-model'

FacetView = require '../main'

bodyTpl = require './body.jade'
monthRangeTpl = require './month-body.jade'

###
# @class
# @namespace Views
# @uses Range
###
class RangeFacet extends FacetView

	###
	# @property
	# @override FacetView::className
	# @type {String}
	###
	className: 'facet range'

	###
	# @property
	# @type {Boolean}
	###
	draggingMin: false

	###
	# @property
	# @type {Boolean}
	###
	draggingMax: false

	###
	# @property
	# @type {Range}
	###
	model: null

	###
	# @method
	# @override FacetView::initialize
	# @construct
	# @param {Object} this.options
	# @param {Config} this.options.config
	# @param {Object} this.options.attrs
	###
	initialize: (@options) ->
		super
		if @options.config.get('rangeMonthMode')
			@model = new MonthRange @options.attrs, parse: true
		else
			@model = new Range @options.attrs, parse: true

		@listenTo @model, 'change:options', @render
		
		@listenTo @model, 'change', (model) =>
			if model.changed.hasOwnProperty('currentMin') or model.changed.hasOwnProperty('currentMax')
				@button.style.display = 'block' if @button? and @options.config.get('autoSearch')
		
		@listenTo @model, 'change:handleMinLeft', (model, value) =>
			@handleMin.css 'left', value
			@bar.css 'left', value + (@model.get('handleWidth')/2)

		@listenTo @model, 'change:handleMaxLeft', (model, value) =>
			@handleMax.css 'left', value
			@bar.css 'right', model.get('sliderWidth') - value - (@model.get('handleWidth')/2)

		@listenTo @model, 'change:currentMin', (model, value) =>
			@labelMin.html Math.ceil value
			if @options.config.get('rangeMonthMode')
				@labelMonthMin.html(@model.getMonthLabel(value, true))
		
		@listenTo @model, 'change:currentMax', (model, value) =>
			@labelMax.html Math.ceil value
			if @options.config.get('rangeMonthMode')
				@labelMonthMax.html(@model.getMonthLabel(value, true))

		@render()

	###
	# @method
	# @override FacetView::render
	# @chainable
	# @return {RangeFacet}
	###
	render: ->
		super

		bodyTpl = @options.config.get('templates')['range.body'] if @options.config.get('templates').hasOwnProperty 'range.body'
		bodyTpl = monthRangeTpl if @options.config.get('rangeMonthMode')
		rtpl = bodyTpl @model.attributes
		@$('.body').html rtpl

		@$('header .menu').hide()

		@dragStopper = @stopDragging.bind(@)
		@$el.on 'mouseleave', @dragStopper

		@resizer = @onResize.bind(@)
		window.addEventListener 'resize', @resizer

		@

	###
	# @method
	# @override FacetView::postRender
	###
	postRender: ->
		# The handles that indicate the position of min and max on the range.
		# Can be dragged
		@handleMin = @$ '.handle-min'
		@handleMax = @$ '.handle-max'

		# The labels holding the min and max value.
		@labelMin = @$ 'label.min'
		@labelMax = @$ 'label.max'
		if @options.config.get('rangeMonthMode')
			@labelMonthMin = @$ 'label.month-min'
			@labelMonthMax = @$ 'label.month-max'
			@labelMonthMin.html(@model.getMonthLabel(@model.get('currentMin')))
			@labelMonthMax.html(@model.getMonthLabel(@model.get('currentMax')))

		# The space (selected range) between the min and max handle.
		@bar = @$ '.bar'

		@button = @el.querySelector('button')

		# The root element of the range facet.
		slider = @$ '.slider'

		if slider.width() isnt 0
			@model.set
				sliderWidth: slider.width()
				sliderLeft: slider.offset().left
				# The relative left position of the min and max handle.
				handleMinLeft: @handleMin.position().left
				handleMaxLeft: @handleMax.position().left
				# The assumption is made that the minHandle and maxHandle have an equal width
				handleWidth: @handleMin.width()

	###
	# @method
	# @override FacetView::events
	###
	events: ->
		_.extend {}, super,
			'mousedown .handle': 'startDragging'
			'mousedown .bar': 'startDragging'
			'mouseup': 'stopDragging'
			'mousemove': 'drag'
			'blur input': 'setYear'
			'keyup input': 'setYear'
			'click button': 'doSearch'
			'dblclick label.min': (ev) -> 
				@enableInputEditable @labelMin
			'dblclick label.max': (ev) ->
				@enableInputEditable @labelMax
			'dblclick label.month-min': (ev) -> 
				@enableInputEditable @labelMonthMin
			'dblclick label.month-max': (ev) ->
				@enableInputEditable @labelMonthMax

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	setYear: (ev) ->
		if ev.type is 'focusout' or ev.type is 'blur' or (ev.type is 'keyup' and ev.keyCode is 13)
			if ev.currentTarget.className.indexOf('month-min') > -1
				@model.setFromLabel currentMin: ev.currentTarget.value
				@disableInputEditable @labelMonthMin
			else if ev.currentTarget.className.indexOf('month-max') > -1
				@model.setFromLabel currentMax: ev.currentTarget.value
				@disableInputEditable @labelMonthMax
			else if ev.currentTarget.className.indexOf('min') > -1
				@model.set currentMin: +ev.currentTarget.value
				@disableInputEditable @labelMin
			else if ev.currentTarget.className.indexOf('max') > -1
				@model.set currentMax: +ev.currentTarget.value
				@disableInputEditable @labelMax

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	doSearch: (ev) ->
		ev.preventDefault()
		@triggerChange()

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	startDragging: (ev) ->
		target = $ ev.currentTarget

		input = target.find 'input'
		# If the bar is dragged, an input is not found.

		if input.length > 0
			# Return if the input is being editted
			return if input.hasClass 'edit'

		if target.hasClass('handle-min')
			@draggingMin = true
			@handleMax.css 'z-index', 10
			target.css 'z-index', 11
		else if target.hasClass 'handle-max'
			@draggingMax = true
			@handleMin.css 'z-index', 10
			target.css 'z-index', 11
		else if target.hasClass 'bar'
			# Set @draggingBar hash with offsetLeft and barWidth, which are
			# needed while dragging.
			@draggingBar =
				offsetLeft: (ev.clientX - @model.get('sliderLeft')) - @model.get('handleMinLeft')
				barWidth: @bar.width()

	###
	# Called on every scroll event! Keep optimized!
	#
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	drag: (ev) ->
		mousePosLeft = ev.clientX - @model.get('sliderLeft')

		if @draggingMin or @draggingMax
			@disableInputOverlap()
			@checkInputOverlap()

		if @draggingBar?
			@updateDash()

			left = mousePosLeft - @draggingBar.offsetLeft
			right = left + @draggingBar.barWidth

			if -1 < left and right <= @model.get('sliderWidth')
				@model.dragMin left
				@model.dragMax right

		if @draggingMin
			@model.dragMin mousePosLeft - (@model.get('handleWidth')/2)

		if @draggingMax
			@model.dragMax mousePosLeft - (@model.get('handleWidth')/2)

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	stopDragging: (ev) ->
		if @draggingMin or @draggingMax or @draggingBar?
			if @draggingMin
				if @model.get('currentMin') isnt +@labelMin.html()
					@model.set currentMin: +@labelMin.html()
				# else
				# 	@enableInputEditable @labelMin

			if @draggingMax
				if @model.get('currentMax') isnt +@labelMax.html()
					@model.set currentMax: +@labelMax.html()
				# else
				# 	@enableInputEditable @labelMax

			@draggingMin = false
			@draggingMax = false
			@draggingBar = null

			# If autoSearch is off, a change event is triggerd to update the queryModel.
			# If autoSearch is on, the range facet doesn't autoSearch, but displays a
			# search button. When the button is clicked, the queryModel is updated and
			# a new search is triggered. If we silently update the model beforehand,
			# the new search would not be triggered.
			unless @options.config.get('autoSearch')
				@triggerChange silent: true
	###
	# @method
	# @param {Object} label Reference to jquery wrapped label element.
	###
	enableInputEditable: (label) ->
		handle = label.closest('.handle')
		input = handle.find('input')
		input.addClass(label.attr("class"))
		handle.addClass 'edit'

		# The `.val(label.html())` is used to put the cursor to the end of the input.
		# see: http://stackoverflow.com/questions/4609405/set-focus-after-last-character-in-text-box
		input.focus().val(label.html())
		
	###
	# @method
	# @param {Object} label Reference to jquery wrapped label element.
	###
	disableInputEditable: (label) ->
		handle = label.closest('.handle')
		handle.removeClass 'edit'

	###
	# Before removing the range facet, the global mouseleave and resize event
	# listeners have to be removed.
	#
	# @method
	###
	destroy: ->
		@$el.off 'mouseleave', @dragStopper
		window.removeEventListener 'resize', @resizer
		@remove()

	###
	# @method
	# @param {Object} [options={}]
	###
	triggerChange: (options={}) ->
		name =  @model.get 'name'
		if @options.config.get('customQueryNames')? && @options.config.get('customQueryNames')[name]
			name = @options.config.get('customQueryNames')[name]
		queryOptions =
			facetValue:
				name: name
				lowerLimit: @model.getLowerLimit()
				upperLimit: @model.getUpperLimit()

		@trigger 'change', queryOptions, options

	###
	# @method
	###
	onResize: ->
		# Calculate and redefine properties.
		@postRender()

		# Calculate the new handle positions.
		@update [
			lowerLimit: @model.get('currentMin')
			upperLimit: @model.get('currentMax')
		]

		# The labels could be overlapping after resize.
		@checkInputOverlap()

	###
	# @method
	###
	checkInputOverlap: ->
		minRect = @labelMin[0].getBoundingClientRect()
		maxRect = @labelMax[0].getBoundingClientRect()

		# If the labels overlap...
		if !(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)
			diff = minRect.right - maxRect.left
			@enableInputOverlap diff
		else
			@disableInputOverlap()

	###
	# @method
	# @param {Number} diff Difference in pixels between labelMin and labelMax.
	###
	enableInputOverlap: (diff) ->
		@labelMin.css 'left', -20 - diff/2
		@labelMax.css 'right', -20 - diff/2

		@updateDash()
		@$('.dash').show()

		@labelMin.addClass 'overlap'
		@labelMax.addClass 'overlap'

	###
	# @method
	###
	disableInputOverlap: ->
		@labelMin.css 'left', -20
		@labelMax.css 'right', -20

		@$('.dash').hide()

		@labelMin.removeClass 'overlap'
		@labelMax.removeClass 'overlap'

	###
	# @method
	###
	updateDash: ->
		@$('.dash').css 'left', @model.get('handleMinLeft') + ((@model.get('handleMaxLeft') - @model.get('handleMinLeft'))/2) + 3

	# Update the labels value.
	# Called on every scroll event! Keep optimized!
#	updateHandleLabel: (handle, leftPos) ->
#		@button.style.display = 'block' if @button? and @options.config.get('autoSearch')
#
#		input = if handle is 'min' then @labelMin else @labelMax
#		input.val @model.getYearFromLeftPos(leftPos)

	###
	# @method
	# @override FacetView::update
	# @param {Object} newOptions
	###
	update: (newOptions) ->
		if _.isArray(newOptions)
			if newOptions[0]?
				newOptions = newOptions[0]

				# This software will break in the year 2500. :)
				if newOptions.lowerLimit < 2500
					ll = newOptions.lowerLimit
					ul = newOptions.upperLimit
				else
					ll = @model.convertLimit2Year newOptions.lowerLimit
					ul = @model.convertLimit2Year newOptions.upperLimit

				@model.set
					currentMin: ll
					currentMax: ul

		else
			@model.reset()

		@button.style.display = 'none' if @button?

	###
	# @method
	# @override FacetView::showBody
	###
	showBody: (done) ->
		ready = =>
			if not @model.has('sliderWidth') or (@model.get('sliderWidth') is 0)
				@postRender()
			
			done() if done?
			
		super ready

module.exports = RangeFacet