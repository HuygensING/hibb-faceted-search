define (require) ->
	config = require 'config'

	ajax = require 'managers/ajax'

	Models =
		Base: require 'models/base'

	class FacetedSearch extends Models.Base

		serverResponse: {} # Make into collection? With caching?		

		defaults: ->
			facetValues: [] # an array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}

		initialize: ->
			super

			@on 'change:sort', => @fetch()

			if @has 'resultRows'
				@resultRows = @get 'resultRows'
				@unset 'resultRows'

		# The attributes of the main model are queryOptions (not server results!)
		# To avoid setting the search results to the attributes, an empty object is returned (and passed to @set)
		parse: -> {}

		set: (attrs, options) ->
			if attrs.facetValue?
				# Remove old facetValue from facetValues
				facetValues = _.reject @get('facetValues'), (data) -> data.name is attrs.facetValue.name
				
				# Move facetValue to facetValues
				facetValues.push attrs.facetValue if attrs.facetValue.values.length # Only push if there are values (values is empty when last checkbox is unchecked)
				attrs.facetValues = facetValues
				delete attrs.facetValue

			super attrs, options

		handleResponse: (response) -> 
			@serverResponse = response
			@publish 'results:change', response

		setCursor: (direction) ->
			if @serverResponse[direction]
				jqXHR = ajax.get url: @serverResponse[direction]
				jqXHR.done (data) => @handleResponse data
				jqXHR.fail => console.error 'setCursor failed'

		sync: (method, model, options) ->
			if method is 'read'
				ajax.token = config.token

				jqXHR = ajax.post
					url: config.baseUrl + config.searchPath
					data: JSON.stringify @attributes
					dataType: 'text'

				jqXHR.done (data, textStatus, jqXHR) =>
					if jqXHR.status is 201
						url = jqXHR.getResponseHeader('Location')
						url += '?rows=' + @resultRows if @resultRows?

						xhr = ajax.get url: url
						xhr.done (data, textStatus, jqXHR) =>
							@handleResponse data
							options.success data

				jqXHR.fail (jqXHR, textStatus, errorThrown) =>
					if jqXHR.status is 401
						@publish 'unauthorized'

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