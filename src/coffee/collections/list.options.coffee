define (require) ->

	Models =
		Option: require 'models/list.option'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.Option

		# parse: (attrs) -> 
		# 	# console.log 'parse', attrs
		# 	attrs

		comparator: (model) ->
			-1 * +model.get('count')

		# Alias for reset, because a collection already has a reset method.
		revert: -> 
			@each (option) => option.set 'checked', false, silent: true
			@trigger 'change'

		updateOptions: (newOptions=[]) ->
			@each (option) => option.set 'count', 0, silent: true

			_.each newOptions, (newOption) =>
				opt = @get newOption.name
				opt.set 'count', newOption.count, silent: true

			@sort()
			