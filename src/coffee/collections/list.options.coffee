define (require) ->

	Models =
		Option: require 'models/list.option'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.Option

		strategies:
			name: (model) -> model.get('name')
			name_opposite: (model) -> 
				# http://stackoverflow.com/questions/5636812/sorting-strings-in-reverse-order-with-backbone-js/5639070#5639070
				String.fromCharCode.apply String, _.map model.get('name').split(''), (c) -> 0xffff - c.charCodeAt()
			count: (model) -> -1 * +model.get('count')
			count_opposite: (model) -> +model.get('count')
		
		orderBy: (strategy) ->
			@comparator = @strategies[strategy]
			@sort()

		initialize: ->
			# Set the default comparator
			@comparator = @strategies.count

		# comparator: do => @strategies.count_descending

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
			