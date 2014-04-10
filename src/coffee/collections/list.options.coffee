Backbone = require 'backbone'
_ = require 'underscore'

Models =
	Option: require '../models/list.option'

class ListOptions extends Backbone.Collection

	model: Models.Option

	# ### Initialize
	initialize: ->
		# Set the default comparator
		@comparator = @strategies.amount_desc

	# ### Methods

	# Alias for reset, because a collection already has a reset method.
	revert: -> 
		@each (option) => option.set 'checked', false, silent: true
		@trigger 'change'

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
		alpha_asc: (model) -> +!model.get('visible') + model.get('name')
		# Name from Z to A
		alpha_desc: (model) -> 
			# http://stackoverflow.com/questions/5636812/sorting-strings-in-reverse-order-with-backbone-js/5639070#5639070
			str = String.fromCharCode.apply String, _.map model.get('name').split(''), (c) -> 0xffff - c.charCodeAt()
			+!model.get('visible') + str
		# Count from low to high
		amount_asc: (model) -> 
			add = if model.get('visible') then 0 else 10000000
			add + +model.get('count')
		# Count from high to low (default)
		amount_desc: (model) -> 
			add = if model.get('visible') then -10000000 else 0
			add + (-1 * +model.get('count'))
	
	orderBy: (strategy) ->
		@comparator = @strategies[strategy]
		@sort()

	setAllVisible: -> 
		@each (model) -> model.set 'visible', true
		@sort()

module.exports = ListOptions