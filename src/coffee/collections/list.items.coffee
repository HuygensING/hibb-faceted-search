define (require) ->

	Models =
		ListItem: require 'models/list.item'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.ListItem