Backbone = require 'backbone'

class ListOption extends Backbone.Model

	idAttribute: 'name'

	defaults: ->
		name: ''
		count: 0
		total: 0
		checked: false
		visible: false

	parse: (attrs) ->
		attrs.total = attrs.count
		
		attrs

module.exports = ListOption