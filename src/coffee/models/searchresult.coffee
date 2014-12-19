Backbone = require 'backbone'
_ = require 'underscore'

config = require '../config'

class SearchResult extends Backbone.Model

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