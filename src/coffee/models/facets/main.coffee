Backbone = require 'backbone'

###
# @class
# @namespace Models
###
class FacetModel extends Backbone.Model

	###
	# @property
	# @type {String}
	###
	idAttribute: 'name'

	###
	# @method
	# @return {Object} Hash of default attributes.
	###
	defaults: ->
		name: null
		title: null
		type: null
		options: null

module.exports = FacetModel