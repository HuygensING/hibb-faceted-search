Backbone = require 'backbone'

###
# @class
# @namespace Models
###
class ListOption extends Backbone.Model

	###
	# @property
	# @type {String}
	###
	idAttribute: 'name'

	###
	# @method
	# @return {Object} Hash of default attributes
	###
	defaults: ->
		name: ''
		count: 0
		total: 0
		checked: false
		visible: false

	###
	# @method
	# @param {Object} attrs
	###
	parse: (attrs) ->
		attrs.total = attrs.count

		attrs

module.exports = ListOption