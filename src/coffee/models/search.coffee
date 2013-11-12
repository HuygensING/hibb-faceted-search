define (require) ->
	Models =
		Base: require 'models/base'

	class Search extends Models.Base

		defaults: ->
			term: '*'
			caseSensitive: false
			title: 'Text search'
			name: 'text_search'

		queryData: ->
			attrs = @attributes
			delete attrs.name
			delete attrs.title
			console.log attrs
			attrs

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