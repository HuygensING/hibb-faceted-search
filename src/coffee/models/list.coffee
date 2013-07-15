define (require) ->

	Models =
		Base: require 'models/base'

	class List extends Models.Base

		idAttribute: 'name'