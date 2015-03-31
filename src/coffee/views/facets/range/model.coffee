_ = require 'underscore'

FacetModel = require '../../../models/facets/main'

###
# @class
# @namespace Models
###
class Range extends FacetModel

	###
	# @method
	# @override FacetModel::defaults
	# @return {Obect} Hash of default attributes.
	###
	defaults: ->
		_.extend {}, super,
			min: null
			max: null
			currentMin: null
			currentMax: null
			handleMinLeft: null
			handleMaxLeft: null
			sliderWidth: null
			# options: {}

	###
	# @method
	# @override FacetModel::initialize
	# @construct
	###
	initialize: ->
		@once 'change', =>
			@on 'change:currentMin', (model, value) =>
				@set handleMinLeft: @getLeftFromYear(value)

			@on 'change:currentMax', (model, value) =>
				@set handleMaxLeft: @getLeftFromYear(value)

			@on 'change:handleMinLeft', (model, value) =>
				@set currentMin: @getYearFromLeft(value)

			@on 'change:handleMaxLeft', (model, value) =>
				@set currentMax: @getYearFromLeft(value)

	###
	# @method
	# @override FacetModel::set
	###
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
		if attrs.hasOwnProperty('currentMin') and @has('min') and attrs.currentMin < @get('min')
			attrs.currentMin = @get 'min'

		# The new currentMax can't be bigger than the initial max.
		if attrs.hasOwnProperty('currentMax') and @has('max') and attrs.currentMax > @get('max')
			attrs.currentMax = @get 'max'

		super


	###
	# @method
	# @override FacetModel::parse
	# @param {Object} attrs Attributes returned by the server.
	# @return {Object} The parsed attributes.
	###
	parse: (attrs) ->
		super

		attrs.min = attrs.currentMin = @convertLimit2Year attrs.options[0].lowerLimit
		attrs.max = attrs.currentMax = @convertLimit2Year attrs.options[0].upperLimit

		delete attrs.options

		attrs

	###
	# Convert the lower and upper limit string to a year.
	#
	# @method
	# @param {Number} limit - Lower or upper limit, for example: 20141213
	# @return {Number} A year, for example: 2014
	# @example "20141213" returns 2014; "8000101" returns 800.
	###
	convertLimit2Year: (limit) ->
		year = limit + ''

		year = "0" if year.length is 0

		if year.length > 4
			if year.length is 8
				year = year.substr 0, 4
			else if year.length is 7
				year = year.substr 0, 3
			else
				throw new Error "Range: lower or upper limit is not 0, 1, 2, 3, 4, 7 or 8 chars!"

		+year

	###
	# Convert a year to a lower or upper limit string
	#
	# @method
	# @private
	# @param {Number} year - A year
	# @param {Boolean} from - If from is true, the limit start at januari 1st, else it ends at december 31st
	# @return {Number} A limit, for example: 20140101
	# @example 2014 returns "20141231"; 800 returns "8000101".
	###
	_convertYear2Limit: (year, from=true) ->
		limit = year + ''
		limit += if from then "0101" else "1231"
		
		+limit

	getLowerLimit: ->
		@_convertYear2Limit @get('currentMin')
	
	getUpperLimit: ->
		@_convertYear2Limit @get('currentMax'), false


	reset: ->
		@set
			currentMin: @get('min')
			currentMax: @get('max')
			lowerLimit: @get('min')
			upperLimit: @get('max')

	# Given a year, return the left position in px.
	getLeftFromYear: (year) ->
		ll = @get('min')
		ul = @get('max')
		sw = @get('sliderWidth')
		hhw = @get('handleWidth')/2

		(((year - ll) / (ul - ll)) * sw) - hhw

	# Given a left position in px, return the corresponding year.
	# Inverse of @getLeftFromYear
	getYearFromLeft: (left) ->
		ll = @get('min')
		ul = @get('max')
		hhw = @get('handleWidth')/2
		sw = @get('sliderWidth')

		Math.round (((left + hhw)/sw) * (ul - ll)) + ll
		
	dragMin: (pos) =>
		handelWidthHalf = @get('handleWidth')/2
		if (-handelWidthHalf) <= pos <= @get('handleMaxLeft')
			@set handleMinLeft: pos

	dragMax: (pos) =>
		if @get('handleMinLeft') < pos <= @get('sliderWidth') - (@get('handleWidth')/2)
			@set handleMaxLeft: pos

module.exports = Range