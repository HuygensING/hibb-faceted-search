FacetModel = require './main'

###
# @class
# @namespace Models
###
class BooleanFacet extends FacetModel

	###
	# @method
	# @override FacetModel::set
	# @param {String|Object} attrs
	# @param {Object} [options]
	###
	set: (attrs, options) ->
		if attrs is 'options'
			options = @parseOptions options
		else if attrs.hasOwnProperty 'options'
			attrs.options = @parseOptions attrs.options

		super attrs, options

	###
	# @method
	# @param {Object} options
	###
	parseOptions: (options) ->
		# If the count is zero, the server does not return it, so we manufacture it here.
		if options.length is 1
			options.push
				name: (!JSON.parse(options[0].name)).toString() # Invert true/false string: JSON.parse ('false' => false), !false (false => true), .toString() (true => 'true')
				count: 0

		options

module.exports = BooleanFacet