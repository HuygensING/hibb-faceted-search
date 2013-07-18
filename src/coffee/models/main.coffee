define (require) ->
	config = require 'config'

	ajax = require 'managers/ajax'

	Models =
		Base: require 'models/base'

	class FacetedSearch extends Models.Base

		serverResponse: {} # Make into collection? With caching?

		defaults: ->
			term: '*'
			facetValues: []

		sync: (method, model, options) ->
			if method is 'read'
				ajax.token = config.token

				jqXHR = ajax.post
					url: config.baseUrl + config.searchUrl
					data: JSON.stringify @attributes
					dataType: 'text'

				jqXHR.done (data, textStatus, jqXHR) =>
					if jqXHR.status is 201
						xhr = ajax.get url: jqXHR.getResponseHeader('Location')
						xhr.done options.success

				jqXHR.fail (jqXHR, textStatus, errorThrown) =>
					if jqXHR.status is 401
						@publish 'unauthorized'

		parse: (attrs) ->
			@serverResponse = attrs
			
			{}

		# queryOptions: ->
		# 	term: '*'
		# 	facetValues: []
		# 	# sort: 'score'
		# 	# fuzzy: false
		# 	# caseSensitive: false

		# 	# sortDir: 'textLayers'
		# 	# asc: ["Diplomatic"]
		# 	# searchInAnnotations: false

		# getQueryOption: (attr) ->
		# 	@get('queryOptions')[attr]

		# setQueryOption: (attr, value) ->
		# 	qo = @get 'queryOptions'
		# 	qo[attr] = value
		# 	@set 'queryOptions', qo
		# 	@trigger 'change:queryOptions'

		# setQueryOptions: (options) ->
		# 	# Facets individually send a facetValue, but the server wants them combined in a 'facetValues'
		# 	# Replace facetValue in facetValues and remove original facetValue
		# 	if options.facetValue?
		# 		facetValues = _.reject @getQueryOption('facetValues'), (data) -> data.name is options.facetValue.name
		# 		facetValues.push options.facetValue if options.facetValue.values.length # Only push if there are values (values is empty when last checkbox is unchecked)
		# 		options.facetValues = facetValues # Add facetValues to options
		# 		delete options.facetValue # The single facetValue is not send to the server

		# 	@setQueryOption attr, value for own attr, value of options

		set: (attrs, options) ->
			if attrs.facetValue?
				facetValues = _.reject @get('facetValues'), (data) -> data.name is attrs.facetValue.name
				facetValues.push attrs.facetValue if attrs.facetValue.values.length # Only push if there are values (values is empty when last checkbox is unchecked)
				attrs.facetValues = facetValues # Add facetValues to options
				delete attrs.facetValue # The single facetValue is not send to the server

			super attrs, options


		# initialize: ->
		# 	super

		# 	@set 'queryOptions', _.extend @queryOptions(), @get('queryOptions')
				

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