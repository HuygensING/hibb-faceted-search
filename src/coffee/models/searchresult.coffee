Backbone = require 'backbone'
_ = require 'underscore'

###
# @class
# @namespace Models
###
class SearchResult extends Backbone.Model
	###
	# @method
	# @return {Object} Hash of default attributes.
	###
	defaults: ->
		_next: null
		_prev: null
		ids: []
		numFound: null
		results: []
		rows: null
		solrquery: ''
		sortableFields: []
		start: null
		# term: ''
		facets: []

module.exports = SearchResult