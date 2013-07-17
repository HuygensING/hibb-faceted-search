define (require) ->
	ajax = require 'managers/ajax'

	Models =
		Base: require 'models/base'

	class FacetedSearch extends Models.Base
		facetValues: {}

		
		defaults: ->
			search: true
			baseUrl: ''
			searchUrl: ''
			token: null

		queryOptions: ->
			term: '*'
			facetValues: []
			# sort: 'score'
			# fuzzy: false
			# caseSensitive: false

			# sortDir: 'textLayers'
			# asc: ["Diplomatic"]
			# searchInAnnotations: false

		getQueryOption: (attr) ->
			@get('queryOptions')[attr]

		setQueryOption: (attr, value) ->
			qo = @get 'queryOptions'
			qo[attr] = value
			@set 'queryOptions', qo
			@trigger 'change:queryOptions'

		setQueryOptions: (options) ->
			# Facets individually send a facetValue, but the server wants them combined in a 'facetValues'
			# Replace facetValue in facetValues and remove original facetValue
			if options.facetValue?
				facetValues = _.reject @getQueryOption('facetValues'), (data) -> data.name is options.facetValue.name
				facetValues.push options.facetValue if options.facetValue.values.length # Only push if there are values (values is empty when last checkbox is unchecked)
				options.facetValues = facetValues # Add facetValues to options
				delete options.facetValue # The single facetValue is not send to the server

			@setQueryOption attr, value for own attr, value of options

		initialize: ->
			super

			@set 'queryOptions', _.extend @queryOptions(), @get('queryOptions')

		sync: (method, model, options) ->
			if method is 'read'
				ajax.token = @get 'token'

				jqXHR = ajax.post
					url: @get('baseUrl') + @get('searchUrl')
					data: JSON.stringify @get 'queryOptions'
					dataType: 'text'

				jqXHR.done (data, textStatus, jqXHR) =>
					if jqXHR.status is 201
						xhr = ajax.get url: jqXHR.getResponseHeader('Location')
						xhr.done options.success

				jqXHR.fail (jqXHR, textStatus, errorThrown) =>
					console.log jqXHR
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