define (require) ->
	Models =
		Base: require 'models/base'

	class ListItem extends Models.Base

		idAttribute: 'name'

		defaults: ->
			name: ''
			count: 0
			checked: false

		parse: (attrs) ->
			if not attrs.name
				attrs.name = '<i>(empty)</i>'

			attrs