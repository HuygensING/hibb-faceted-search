define (require) ->

	Models =
		ListItem: require 'modules/faceted-search/models/list.item'

	Collections =
		Base: require 'collections/base'

	class ListItems extends Collections.Base

		model: Models.ListItem