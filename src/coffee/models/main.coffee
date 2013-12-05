define (require) ->
	SearchResults = require 'collections/searchresults'

	class FacetedSearch extends Backbone.Model

		defaults: ->
			# an array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
			facetValues: []

		# ### Initialize

		# This model's attributes are the queryOptions. On initialize we pass the initial queryOptions, coming from the
		# FacetedSearch's config.
		initialize: (@queryOptions, options) ->
			@searchResults = new SearchResults()

			# Run a new query everytime something changes on the model (@attributes are the queryOptions).
			@on 'change', (model, options) => @searchResults.runQuery @attributes

			# Manually trigger the change event, because the initial @querySettings, don't trigger the change event
			# and thus searchResult.runQuery isn't called.
			@trigger 'change'

		# ### Overrides
		set: (attrs, options) ->
			if attrs.facetValue?
				# Remove old facetValue from facetValues
				facetValues = _.reject @get('facetValues'), (data) -> data.name is attrs.facetValue.name
				
				# Move facetValue to facetValues
				facetValues.push attrs.facetValue if attrs.facetValue.values.length # Only push if there are values (values is empty when last checkbox is unchecked)
				attrs.facetValues = facetValues
				delete attrs.facetValue

			super attrs, options
			
		# ### Methods

		# Silently change @attributes and trigger a change event manually afterwards.
		reset: ->
			@clear silent: true
			@set @defaults(), silent: true
			@set @queryOptions, silent: true
			@trigger 'change'

		page: (pagenumber) -> 
			@searchResults.current.options.pagenumber = pagenumber
			@searchResults.current.fetch
				success: (model) => console.log model



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