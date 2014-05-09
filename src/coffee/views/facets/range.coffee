$ = require 'jquery'
_ = require 'underscore'

config = require '../../config'

Models =
	Range: require '../../models/range'

Views = 
	Facet: require './main'

bodyTpl = require '../../../jade/facets/range.body.jade'

# Define the width/height of the handles (.max-handle and .min-handle)
# The size is also defined in the CSS by a variable, these two should
# be kept in sync.
handleSize = 12

class RangeFacet extends Views.Facet

	className: 'facet range'

	initialize: (options) ->
		super

		@draggingMin = false
		@dragginMax = false

		@model = new Models.Range options.attrs, parse: true
		@listenTo @model, 'change:options', @render
		@render()
		# @postRender()

	render: ->
		super

		bodyTpl = config.templates['range.body'] if config.templates.hasOwnProperty 'range.body'

		rtpl = bodyTpl @model.attributes
		@$('.body').html rtpl

		@$('header .menu').hide()

		# Call postRender after the view has been attached to the DOM.
		setTimeout (=> @postRender()), 0

		@$el.mouseleave => @stopDragging()

		@

	postRender: ->
		# Create references to DOM elements and unchanging sizes and positions,
		# because we need this data in the mousemove event (hence, it is triggered)
		# many, many, many times and we don't want to execute the jQuery wrapper
		# numerous times.
		@$minHandle = @$('.min-handle')
		@$maxHandle = @$('.max-handle')
		@$minValue = @$('.min-value')
		@$maxValue = @$('.max-value')
		@$bar = @$('.bar')

		$slider = @$('.slider')
		@sliderWidth = $slider.width()
		@sliderLeft = $slider.offset().left
		@minHandleLeft = handleSize/-2
		@maxHandleLeft = @sliderWidth - (handleSize/2)

		@$maxHandle.css 'left', @maxHandleLeft

	events: ->
		'mousedown .max-handle': 'startDragging'
		'mousedown .min-handle': 'startDragging'
		'mouseup': 'stopDragging'
		'mousemove': 'drag'
		'click .slider': 'moveHandle'
		'click button': 'doSearch'

	doSearch: (ev) ->
		ev.preventDefault()

		@triggerChange()

	triggerChange: (silent=false) ->
		eventName = 'change'
		eventName = 'change:silent' unless silent

		@trigger eventName,
			facetValue:
				name: @model.get 'name'
				lowerLimit: +(@$minValue.html()+'0101')
				upperLimit: +(@$maxValue.html()+'1231')

	moveHandle: (ev) ->
		# Only continue if target is .slider or .bar, when users click on the search button
		# or on the min-value or max-value, don't move a handle.
		return unless ev.target is @el.querySelector('.slider') or ev.target is @el.querySelector('.bar')

		left = ev.clientX - @sliderLeft
		if Math.abs(@$minHandle.position().left - left) < Math.abs(@$maxHandle.position().left - left)
			@$minHandle.css 'left', left - (handleSize/2)
			@$bar.css 'left', left
			@updateValue @$minValue, left
		else
			@$maxHandle.css 'left', left - (handleSize/2)
			@$bar.css 'right', @sliderWidth - left
			@updateValue @$maxValue, left

	startDragging: (ev) ->
		target = $ ev.currentTarget

		if target.hasClass 'max-handle'
			@draggingMax = true
			@$minHandle.css 'z-index', 10
		else if target.hasClass 'min-handle'
			@draggingMin = true
			@$maxHandle.css 'z-index', 10

		target.css 'z-index', 11

	stopDragging: ->
		@draggingMin = false
		@draggingMax = false

		minRect = @$minValue[0].getBoundingClientRect()
		maxRect = @$maxValue[0].getBoundingClientRect()

		if !(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)
			# Change opacity so element keeps taking it's space
			@$minValue.css 'opacity', 0
			@$maxValue.css 'opacity', 0
			@$('.single-value').show()
			handlesCenter = @minHandleLeft + ((@maxHandleLeft - @minHandleLeft)/2)
			left = handlesCenter - @$('.single-value').width()/2 + 6
			left = @sliderWidth - @$('.single-value').width() + 18 if @sliderWidth - left < @$('.single-value').width()
			@$('.single-value').css 'left', left
		else
			@$minValue.css 'opacity', 1
			@$maxValue.css 'opacity', 1
			@$('.single-value').hide()

	drag: (ev) ->
		if @draggingMin
			left = ev.clientX - @sliderLeft
			@minHandleLeft = left - (handleSize/2)

			if -1 < left <= @sliderWidth and @maxHandleLeft > @minHandleLeft
				@$minHandle.css 'left', @minHandleLeft
				@$bar.css 'left', left
				@updateValue 'minValue', left

		if @draggingMax
			left = ev.clientX - @sliderLeft
			@maxHandleLeft = left - (handleSize/2)

			if -1 < left <= @sliderWidth and @maxHandleLeft > @minHandleLeft
				@$maxHandle.css 'left', @maxHandleLeft
				@$bar.css 'right', @sliderWidth - left
				@updateValue 'maxValue', left

	updateValue: (handle, left) ->
		@$('button').show()

		ll = @model.get('options').lowerLimit
		ul = @model.get('options').upperLimit
		value = Math.floor (left/@sliderWidth * (ul - ll)) + ll

		$el = if handle is 'minValue' then @$minValue else @$maxValue
		$el.html value

		html = if handle is 'minValue' then "#{value} - #{@$maxValue.html()}" else "#{@$minValue.html()} - #{value}"
		@$('.single-value').html html

		@triggerChange true

	getLeftPosFromYear: (year) ->
		ll = @model.get('options').lowerLimit
		ul = @model.get('options').upperLimit
		left = ((year - ll) / (ul - ll)) * @sliderWidth
		Math.floor left

	setMinValue: (year) ->
		left = @getLeftPosFromYear year
		@$minHandle.css 'left', left
		@$minValue.html year
		@$bar.css 'left', left
		@minHandleLeft = left - (handleSize/2)
		

	setMaxValue: (year) ->
		left = @getLeftPosFromYear year
		@$maxHandle.css 'left', left
		@$maxValue.html year
		@$bar.css 'right', @sliderWidth - left
		@maxHandleLeft = left - (handleSize/2)

	update: (newOptions) ->
		newOptions = newOptions[0] if _.isArray(newOptions)

		@setMinValue +(newOptions.lowerLimit+'').substr(0, 4)
		@setMaxValue +(newOptions.upperLimit+'').substr(0, 4)

		@$('button').hide()

	reset: ->

module.exports = RangeFacet