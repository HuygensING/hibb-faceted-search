FacetModel = require './main'
_ = require 'underscore'

class RangeFacet extends FacetModel

	defaults: -> _.extend {}, super,
		min: null
		max: null
		currentMin: null
		currentMax: null
		handleMinLeft: null
		handleMaxLeft: null
		sliderWidth: null
		options: {}

	initialize: ->
		@on 'change:currentMin', (model, value) =>
			@set handleMinLeft: @getLeftFromYear(value)

		@on 'change:currentMax', (model, value) =>
			@set handleMaxLeft: @getLeftFromYear(value)

		@on 'change:handleMinLeft', (model, value) =>
			@set currentMin: @getYearFromLeft(value)

		@on 'change:handleMaxLeft', (model, value) =>
			@set currentMax: @getYearFromLeft(value)

	set: (attrs, options) ->
		if attrs.hasOwnProperty 'currentMin'
			if attrs.currentMin > @get('currentMax')
				attrs.currentMax = +attrs.currentMin
				attrs.currentMin = @get 'currentMax'

		if attrs.hasOwnProperty 'currentMax'
			if attrs.currentMax < @get('currentMin')
				attrs.currentMin = +attrs.currentMax
				attrs.currentMax = @get 'currentMin'

		# The new currentMin can't be smaller than the initial min.
		if attrs.hasOwnProperty('currentMin') and attrs.currentMin < @get('min')
			attrs.currentMin = @get 'min'

		# The new currentMax can't be bigger than the initial max.
		if attrs.hasOwnProperty('currentMax') and attrs.currentMax > @get('max')
			attrs.currentMax = @get 'max'

		super

	parse: (attrs) ->
		super

		attrs.options =
			lowerLimit: +((attrs.options[0].lowerLimit+'').substr(0, 4))
			upperLimit: +((attrs.options[0].upperLimit+'').substr(0, 4))

		attrs.min = attrs.currentMin = attrs.options.lowerLimit
		attrs.max = attrs.currentMax = attrs.options.upperLimit

		attrs

	# CUSTOM METHODS

	# Given a year, return the left position in px.
	getLeftFromYear: (year) ->
		ll = @get('options').lowerLimit
		ul = @get('options').upperLimit
		sw = @get('sliderWidth')
		hhw = @get('handleWidth')/2

		(((year - ll) / (ul - ll)) * sw) - hhw

	# Given a left position in px, return the corresponding year.
	# Inverse of @getLeftFromYear
	getYearFromLeft: (left) ->
		ll = @get('options').lowerLimit
		ul = @get('options').upperLimit
		hhw = @get('handleWidth')/2
		sw = @get('sliderWidth')

		(((left + hhw)/sw) * (ul - ll)) + ll

	dragMin: (pos) =>
		if -1 < pos <= @get('handleMaxLeft')
			@set handleMinLeft: pos

	dragMax: (pos) =>
		if @get('handleMinLeft') < pos <= @get('sliderWidth')
			@set handleMaxLeft: pos

module.exports = RangeFacet