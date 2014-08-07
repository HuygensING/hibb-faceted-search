Backbone = require 'backbone'
_ = require 'underscore'

Models =
	Option: require '../models/facets/list.option.coffee'

class ListOptions extends Backbone.Collection

	model: Models.Option

	# ### Initialize
	initialize: ->
		# Set the default comparator
		@comparator = @strategies.amount_desc

	# ### Methods

	# Alias for reset, because a collection already has a reset method.
	revert: ->
		@comparator = @strategies.amount_desc

		@each (option) => option.set 'checked', false, silent: true

	# TODO Don't do two loops, combine into one.
	updateOptions: (newOptions=[]) ->
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

	orderBy: (strategy, silent=false) ->
		@comparator = @strategies[strategy]
		@sort(silent: silent)

	setAllVisible: ->
		@each (model) -> model.set 'visible', true
		@sort()

module.exports = ListOptions