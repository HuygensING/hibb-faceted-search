define (require) ->

	Models =
		Base: require 'models/base'

	class ServerResponse extends Models.Base

		defaults: ->
			_next: ''
			_prev: ''
			ids: []
			numFound: null
			results: []
			rows: null
			solrquery: ''
			sortableFields: []
			start: null
			term: ''