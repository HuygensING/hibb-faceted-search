define (require) ->
	SearchResults = require 'collections/searchresults'

	class FacetedSearch extends Backbone.Model

		defaults: ->
			# an array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
			facetValues: []
			# an array of objects containing fieldname and direction: {fieldname: 'language', direction: 'desc'}
			sortParameters: []

		# ### Initialize

		# This model's attributes are the queryOptions. On initialize we pass the initial queryOptions, coming from the
		# FacetedSearch's config.
		initialize: (@queryOptions, options) ->
			@searchResults = new SearchResults()

			# Run a new query everytime something changes on the model (@attributes are the queryOptions).
			# Clone the attributes/queryOptions to preserve the hash, because we remove the resultRows
			# before sending the hash to the server.
			@on 'change', (model, options) => @searchResults.runQuery _.clone(@attributes)

			# Manually trigger the change event, because the initial @querySettings, don't trigger the change event
			# and thus searchResult.runQuery isn't called.
			@trigger 'change'

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

		# Silently change @attributes and trigger a change event manually afterwards.
		reset: ->
			@clear silent: true
			@set @defaults(), silent: true
			@set @queryOptions, silent: true
			@trigger 'change'

		# A refresh of the Faceted Search means (re)sending the current @attributes (queryOptions) again.
		# We set the cache flag to false, otherwise the searchResults collection will return the cached
		# model, instead of fetching a new one from the server.
		# The newQueryOptions are optional. The can be used to add or update one or more queryOptions
		# before sending the same (or now altered) queryOptions to the server again.
		refresh: (newQueryOptions={}) -> 
			@set key, value for own key, value of newQueryOptions
			@searchResults.runQuery _.clone(@attributes), false

# EXAMPLE QUERY:
# {
#   "term": "bla bloe z*",
#   "facetValues": [
#     {
#       "name": "metadata_folio_number",
#       "values": [ "191", "192" ],
#     }
#   ],
#   "sort": "score",
#   "sortDir": "asc",
#   "fuzzy": false,
#   "caseSensitive": false,
#   "textLayers": [
#     "Diplomatic"
#   ],
#   "searchInAnnotations": false
# }