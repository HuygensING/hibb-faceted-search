$ = require 'jquery'
_ = require 'underscore'

Models =
	Range: require '../../models/facets/range'

Views = 
	Facet: require './main'

bodyTpl = require '../../../jade/facets/range.body.jade'

# Placeholders for stopDrag and onResize method, needed for removing event listeners.
dragStopper = null
resizer = null

class RangeFacet extends Views.Facet
	className: 'facet range'

	# ### INITIALIZE
	initialize: (options) ->
		super

		@config = options.config

		@draggingMin = false
		@draggingMax = false

		@model = new Models.Range options.attrs, parse: true
		@listenTo @model, 'change:options', @render
		@listenTo @model, 'change', (model) =>
			if model.changed.hasOwnProperty('currentMin') or model.changed.hasOwnProperty('currentMax')
				@button.style.display = 'block' if @button? and @config.get('autoSearch')
		@listenTo @model, 'change:handleMinLeft', (model, value) =>
			@handleMin.css 'left', value
			@bar.css 'left', value

		@listenTo @model, 'change:handleMaxLeft', (model, value) =>
			@handleMax.css 'left', value
			@bar.css 'right', model.get('sliderWidth') - value

		@listenTo @model, 'change:currentMin', (model, value) =>
			@inputMin.val Math.ceil value

		@listenTo @model, 'change:currentMax', (model, value) =>
			@inputMax.val Math.ceil value

		@render()

	# ### RENDER
	render: ->
		super

		bodyTpl = @config.get('templates')['range.body'] if @config.get('templates').hasOwnProperty 'range.body'

		rtpl = bodyTpl @model.attributes
		@$('.body').html rtpl

		@$('header .menu').hide()

		dragStopper = @stopDragging.bind(@)
		@$el.on 'mouseleave', dragStopper

		resizer = @onResize.bind(@)
		window.addEventListener 'resize', resizer

		setTimeout (=> @postRender()), 0

		@

	postRender: ->
		# The handles that indicate the position of min and max on the range.
		# Can be dragged
		@handleMin = @$ '.handle-min'
		@handleMax = @$ '.handle-max'

		# The labels holding the min and max value.
		@inputMin = @$ 'input.min'
		@inputMax = @$ 'input.max'

		# The space (selected range) between the min and max handle.
		@bar = @$ '.bar'

		@button = @el.querySelector('button')

		# The root element of the range facet.
		slider = @$ '.slider'

		@model.set
			sliderWidth: slider.width()
			sliderLeft: slider.offset().left
			# The relative left position of the min and max handle.
			handleMinLeft: @handleMin.position().left
			handleMaxLeft: @handleMax.position().left
			# The assumption is made that the minHandle and maxHandle have an equal width
			handleWidth: @handleMin.width()

	# ### EVENTS
	events: -> _.extend {}, super,
		'mousedown .handle': 'startDragging'
		'mousedown .bar': 'startDragging'
		'mouseup': 'stopDragging'
		'mousemove': 'drag'
		'blur input': 'setYear'
		'keyup input': 'setYear'
		'click button': 'doSearch'
		'dblclick input.min': (ev) -> 
			@enableInputEditable @inputMin
		'dblclick input.max': (ev) ->
			@enableInputEditable @inputMax

	setYear: (ev) ->
		if ev.type is 'focusout' or ev.type is 'blur' or (ev.type is 'keyup' and ev.keyCode is 13)
			if ev.currentTarget.className.indexOf('min') > -1
				@model.set currentMin: +ev.currentTarget.value
				@disableInputEditable @inputMin
			else if ev.currentTarget.className.indexOf('max') > -1
				@model.set currentMax: +ev.currentTarget.value
				@disableInputEditable @inputMax


	doSearch: (ev) ->
		ev.preventDefault()
		@triggerChange()

	startDragging: (ev) ->
		target = $ ev.currentTarget

		# Return if the input is editable, ie: not disabled.
		input = target.find 'input'
		# If the bar is dragged, an input is not found.
		if input.length > 0
			return unless input.attr('disabled')?

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

	# Called on every scroll event! Keep optimized!
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

	stopDragging: ->
		if @draggingMin or @draggingMax or @draggingBar?
			if @draggingMin
				if @model.get('currentMin') isnt +@inputMin.val()
					@model.set currentMin: +@inputMin.val()
				# else
				# 	@enableInputEditable @inputMin

			if @draggingMax
				if @model.get('currentMax') isnt +@inputMax.val()
					@model.set currentMax: +@inputMax.val()
				# else
				# 	@enableInputEditable @inputMax

			@draggingMin = false
			@draggingMax = false
			@draggingBar = null

			# If autoSearch is off, a change event is triggerd to update the queryModel.
			# If autoSearch is on, the range facet doesn't autoSearch, but displays a
			# search button. When the button is clicked, the queryModel is updated and
			# a new search is triggered. If we silently update the model beforehand,
			# the new search would not be triggered.
			unless @config.get('autoSearch')
				@triggerChange silent: true

	enableInputEditable: (input) ->
		input.attr 'disabled', null
		input.focus()

	disableInputEditable: (input) ->
		input.attr 'disabled', true

	# ### METHODS

	destroy: ->
		@$el.off 'mouseleave', dragStopper
		window.removeEventListener 'resize', resizer
		@remove()

	triggerChange: (options={}) ->
		queryOptions =
			facetValue:
				name: @model.get 'name'
				lowerLimit: @model.get('currentMin')+'0101'
				upperLimit: @model.get('currentMax')+'1231'

		@trigger 'change', queryOptions, options

	onResize: ->
		# Calculate and redefine properties.
		@postRender()

		# Calculate the new handle positions.
		@update
			lowerLimit: @model.get('currentMin')
			upperLimit: @model.get('currentMax')

		# The labels could be overlapping after resize.
		@checkInputOverlap()

	checkInputOverlap: ->
		minRect = @inputMin[0].getBoundingClientRect()
		maxRect = @inputMax[0].getBoundingClientRect()

		# If the labels overlap...
		if !(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)
			diff = minRect.right - maxRect.left
			@enableInputOverlap diff
		else
			@disableInputOverlap()

	enableInputOverlap: (diff) ->
		@inputMin.css 'left', -20 - diff/2
		@inputMax.css 'right', -20 - diff/2

		@updateDash()
		@$('.dash').show()

		@inputMin.addClass 'overlap'
		@inputMax.addClass 'overlap'

	disableInputOverlap: ->
		@inputMin.css 'left', -20
		@inputMax.css 'right', -20

		@$('.dash').hide()

		@inputMin.removeClass 'overlap'
		@inputMax.removeClass 'overlap'

	updateDash: ->
		@$('.dash').css 'left', @model.get('handleMinLeft') + ((@model.get('handleMaxLeft') - @model.get('handleMinLeft'))/2) + 3

	# Update the labels value.
	# Called on every scroll event! Keep optimized!
#	updateHandleLabel: (handle, leftPos) ->
#		@button.style.display = 'block' if @button? and @config.get('autoSearch')
#
#		input = if handle is 'min' then @inputMin else @inputMax
#		input.val @model.getYearFromLeftPos(leftPos)

	update: (newOptions) ->
		if _.isArray(newOptions)
			if newOptions[0]?
				newOptions = newOptions[0]
			else
				newOptions =
					lowerLimit: @model.get('options').lowerLimit
					upperLimit: @model.get('options').upperLimit

		# Set the current attributes in the range model.
		# Only use the years from the newOptions lower and upper limits.
		@model.set
			currentMin: +(newOptions.lowerLimit+'').substr(0, 4)
			currentMax: +(newOptions.upperLimit+'').substr(0, 4)

		@button.style.display = 'none' if @button?



module.exports = RangeFacet