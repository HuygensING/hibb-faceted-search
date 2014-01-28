define (require) ->

	Models =
		Facet: require 'models/facet'

	class RangeFacet extends Models.Facet

		parse: (attrs) ->
			super
			
			attrs.options =
				lowerLimit: +((attrs.options[0].lowerLimit+'').substr(0, 4))
				upperLimit: +((attrs.options[0].upperLimit+'').substr(0, 4))
			attrs