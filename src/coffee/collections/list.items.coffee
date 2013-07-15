define (require) ->

	Models =
		ListItem: require 'models/list.item'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.ListItem

		comparator: (model) ->
			-1 * parseInt model.get('count'), 10

		updateOptions: (newOptions) ->
			@each (option) => option.set 'count', 0

			_.each newOptions, (newOption) =>
				newOption.name = '<i>(empty)</i>' if newOption.name is '' # Bugprone what if somebody changes the default empty name?
				opt = @get newOption.name
				opt.set 'count', newOption.count

			@sort()
			