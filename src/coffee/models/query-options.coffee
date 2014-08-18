Backbone = require 'backbone'
_ = require 'underscore'
config = require '../config'

class QueryOptions extends Backbone.Model

	defaults: ->
		# an array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
		facetValues: []
		# an array of objects containing fieldname and direction: {fieldname: 'language', direction: 'desc'}
		sortParameters: []

	# initialize: (@initialAttributes) -> is concise, but not very explicit.
	initialize: (@options) ->
		# Store the initial attributes, they are (re)set to the model on reset.
		@initialAttributes = @options

	# ### Overrides
	set: (attrs, options) ->
		if attrs.facetValue?
			# Remove old facetValue from facetValues
			facetValues = _.reject @get('facetValues'), (data) -> data.name is attrs.facetValue.name

			# If facetValue has a 'values' property (in case of a list or boolean for example), only add the
			# facetValue if the values array is populated.
			if attrs.facetValue.values?
				if attrs.facetValue.values.length > 0 # Only push if there are values (values is empty when last checkbox is unchecked)
					facetValues.push attrs.facetValue
			# Else, in case of range for example, push to facetValues
			else
				facetValues.push attrs.facetValue

			# Add all facetValues to attrs, so it is set to the model.
			attrs.facetValues = facetValues

			# Remove the single facetValue that was passed and is now added to the facetValues.
			delete attrs.facetValue

		super attrs, options

	# ### Methods

	# Reset the queryOptions to it's initial state.
	reset: ->
		# Remove attributes.
		@clear silent: true

		# Reset the defaults.
		@set @defaults(), silent: true

		# Reset the attributes passed on initialization.
		@set @initialAttributes, silent: true

module.exports = QueryOptions

# EXAMPLE QUERY:
# {
#   "term": "bla bloe z*",
#   "facetValues": [
#     {
#       "name": "metadata_folio_number",
#       "values": [ "191", "192" ]
#     }
#   ],
#		"sortParameters": [
#			{
#       "fieldname": "metadata_folio_side",
#       "direction": "asc"
#     }
#		],
#   "fuzzy": false,
#   "caseSensitive": false,
#   "textLayers": [
#     "Diplomatic"
#   ],
#   "searchInAnnotations": false
# }