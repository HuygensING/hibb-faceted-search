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
			token: ''

		queryOptions: ->
			term: '*'
			sort: 'score'
			fuzzy: false
			facetValues: []
			caseSensitive: false
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

		initialize: ->
			super

			@set 'queryOptions', _.extend @queryOptions(), @get('queryOptions')

			@on 'change:queryOptions', @fetch, @

			@subscribe 'facet:list:changed', (data) =>
				if data.values.length
					@facetValues[data.name] = data
				else
					delete @facetValues[data.name]

				@setQueryOption 'facetValues', _.values @facetValues

		fetch: ->
			ajax.token = @get 'token'

			fetchResults = (url) => # GET results from the server
				jqXHR = ajax.get url: url
				jqXHR.done (data) =>
					@publish 'faceted-search:results', data

			jqXHR = ajax.post
				url: @get('baseUrl') + @get('searchUrl')
				data: JSON.stringify @get 'queryOptions'
				dataType: 'text'

			jqXHR.done (data, textStatus, jqXHR) =>
				if jqXHR.status is 201
					fetchResults jqXHR.getResponseHeader('Location')

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