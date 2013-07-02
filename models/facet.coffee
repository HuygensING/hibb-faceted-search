define (require) ->

	Models =
		Base: require 'models/base'
		
	class Facet extends Models.Base