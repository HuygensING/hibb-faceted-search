define (require) ->

	Models =
		Facet: require 'modules/faceted-search/models/facet'

	Collections =
		Base: require 'collections/base'

	class Facets extends Collections.Base

		model: Models.Facet

	new Facets()