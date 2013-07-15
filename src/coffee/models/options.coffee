define (require) ->
	Backbone = require 'backbone'

	class Options extends Backbone.Model
		defaults:
			search: true
			defaultQuery:
				term: '*'

	new Options()