define (require) ->

	Models =
		Base: require 'models/base'

	Collections = 
		ListItems: require 'collections/list.items'

	class List extends Models.Base

		parse: (attrs) ->
			attrs.options = new Collections.ListItems attrs.options, parse: true

			attrs