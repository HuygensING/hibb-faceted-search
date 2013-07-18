define (require) ->

	Models =
		Facet: require 'models/facet'

	class BooleanFacet extends Models.Facet

		set: (attrs, options) ->
			if attrs is 'options'
				options = @parseOptions options
			else if attrs.options?
				attrs.options = @parseOptions attrs.options

			super attrs, options

		parseOptions: (options) ->
			if options.length is 1
				options.push
					name: (!JSON.parse(options[0].name)).toString() # Invert true/false string: JSON.parse ('false' => false), !false (false => true), .toString() (true => 'true')
					count: 0

			options