Backbone = require 'backbone'
config = require '../config'
	
class Facet extends Backbone.Model

	idAttribute: 'name'

	parse: (attrs) ->
		# If name is present in map, than use it as title
		if config.facetTitleMap.hasOwnProperty attrs.name
			attrs.title = config.facetTitleMap[attrs.name]
		# If the name is not present, set the title (from db) to the facetNameMap,
		# because we use the map to set the correct titles when showing the selected facet values.
		else
			config.facetTitleMap[attrs.name] = attrs.title

		attrs

module.exports = Facet