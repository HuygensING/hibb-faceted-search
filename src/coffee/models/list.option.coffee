define (require) ->
	class ListItem extends Backbone.Model

		idAttribute: 'name'

		defaults: ->
			name: ''
			count: 0
			total: 0
			checked: false

		parse: (attrs) ->
			attrs.total = attrs.count
			
			attrs