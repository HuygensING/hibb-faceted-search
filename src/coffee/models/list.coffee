define (require) ->

	Models =
		Facet: require 'models/facet'

	class List extends Models.Facet