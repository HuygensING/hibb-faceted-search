define (require) ->
	Models =
		Base: require 'models/base'

	class ListItem extends Models.Base

		parse: (attrs) ->
			if not attrs.name
				attrs.name = '<i>empty</i>'

			attrs