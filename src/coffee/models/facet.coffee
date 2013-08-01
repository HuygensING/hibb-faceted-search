define (require) ->

	config = require 'config'

	Models =
		Base: require 'models/base'
		
	class Facet extends Backbone.Model

		idAttribute: 'name'

		parse: (attrs) ->
			attrs.title = config.facetNameMap[attrs.name] if not attrs.title? or attrs.title is '' and config.facetNameMap[attrs.name]?

			attrs