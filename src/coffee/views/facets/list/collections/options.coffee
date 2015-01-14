Backbone = require 'backbone'
_ = require 'underscore'

ListOption = require '../models/option.coffee'

###
# @class
# @namespace Collections
# @uses ListOption
###
class ListOptions extends Backbone.Collection

	###
	# @property
	# @type ListOption
	###
	model: ListOption

	###
	# Default sorting strategy.
	#
	# @property
	# @type {Function}
	###
	comparator: null

	###
	# @method
	# @construct
	###
	initialize: ->
		# Set the default comparator
		@comparator = @strategies.amount_desc

	
	###
	# Alias for reset, because a Backbone.Collection already has a reset method.
	#
	# @method
	###
	revert: ->
		@comparator = @strategies.amount_desc

		@each (option) => option.set 'checked', false, silent: true

	###
	# @method
	# @param {Array<Object>} [newOptions=[]] Only the new options which have a count greater than zero are passed for the update. List of {count: Number, name: String}.
	# @todo Don't do two loops, combine into one.
	###
	update: (newOptions=[]) ->
		# Reset all the options count to 0
		@each (option) => option.set 'count', 0, silent: true

		# Loop the options returned by the server to update the count on each one.
		_.each newOptions, (newOption) =>
			opt = @get newOption.name

			# If option already exists in the collection, update the count.
			if opt?
				opt.set 'count', newOption.count, silent: true
			# Else create the new option and add it to the collection.
			else
				opt = new Models.Option newOption
				@add opt

		@sort()

	###
	# Hash of sorting strategies.
	#
	# @property
	# @type {Object}
	###
	strategies:
		# Name from A to Z
		# +!true == +false == 0
		# +!false == +true == 1
		# +!!0 == +false = 0
		# +!!53 == +true = 1 // Everything above 0.
		# Visible models and models with a count > 0 get preference over name.
		alpha_asc: (model) -> +!model.get('visible') + (+!model.get('count') + model.get('name'))
		# Name from Z to A
		# Visible models and models with a count > 0 get preference over name.
		alpha_desc: (model) ->
			# http://stackoverflow.com/questions/5636812/sorting-strings-in-reverse-order-with-backbone-js/5639070#5639070
			str = String.fromCharCode.apply String, _.map model.get('name').split(''), (c) -> 0xffff - c.charCodeAt()
			+!model.get('visible') + (+!model.get('count') + str)
		# Count from low to high
		amount_asc: (model) ->
			tmp = if model.get('visible') then 0 else 10
			tmp += +!model.get('count')
			cnt = if model.get('count') is 0 then model.get('total') else model.get('count')
			tmp -= 1/cnt
		# Count from high to low (default)
		amount_desc: (model) ->
			tmp = if model.get('visible') then 0 else 10
			tmp += +!model.get('count')
			cnt = if model.get('count') is 0 then model.get('total') else model.get('count')
			tmp += 1/cnt
#      add = if model.get('visible') then -10000000 else 0
#      add + (-1 * +model.get('count'))

	###
	# @method
	# @param {Function} strategy One of the sorting strategy functions
	# @param {Boolean} [silent=false] Set to true to disable the triggering of the sort event.
	###
	orderBy: (strategy, silent=false) ->
		@comparator = @strategies[strategy]
		@sort(silent: silent)

	###
	# Set all options to visible and sort afterwards.
	#
	# @method
	###
	setAllVisible: ->
		@each (model) -> model.set 'visible', true
		@sort()

module.exports = ListOptions