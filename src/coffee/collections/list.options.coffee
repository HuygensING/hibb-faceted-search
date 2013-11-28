define (require) ->

	Models =
		Option: require 'models/list.option'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.Option

		comparator: (model) ->
			-1 * +model.get('count')

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
			