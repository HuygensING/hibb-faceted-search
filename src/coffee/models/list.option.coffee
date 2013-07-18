define (require) ->
	Models =
		Base: require 'models/base'

	class ListItem extends Models.Base

		idAttribute: 'name'

		defaults: ->
			name: ''
			count: 0
			total: 0
			checked: false

		parse: (attrs) ->
			attrs.total = attrs.count
			
			attrs