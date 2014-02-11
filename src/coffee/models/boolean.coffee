Models =
	Facet: require './facet'

class BooleanFacet extends Models.Facet

	set: (attrs, options) ->
		if attrs is 'options'
			options = @parseOptions options
		else if attrs.options?
			attrs.options = @parseOptions attrs.options

		super attrs, options

	parseOptions: (options) ->
		# If the model has an options attribute, use it, otherwise use the passed
		# options by set. We do this to remember the checked (true/false) var in the 
		# options. The count and name do not change, so we can reuse the already set
		# options attribute, if present.
		options = @get('options') ? options
		
		# If the count is zero, the server does not return it, so we manufacture it here.
		if options.length is 1
			options.push
				name: (!JSON.parse(options[0].name)).toString() # Invert true/false string: JSON.parse ('false' => false), !false (false => true), .toString() (true => 'true')
				count: 0

		options

module.exports = BooleanFacet