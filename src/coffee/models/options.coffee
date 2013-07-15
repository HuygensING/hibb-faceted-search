define (require) ->
	Backbone = require 'backbone'

	class Options extends Backbone.Model
		defaults:
			search: true
			defaultQuery:
				term: '*'
				facetValues: []

	new Options()