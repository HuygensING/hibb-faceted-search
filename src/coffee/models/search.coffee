Backbone = require 'backbone'
_ = require 'underscore'

class Search extends Backbone.Model

	defaults: ->
		term: '*'
		caseSensitive: false
		fuzzy: false
		title: 'Text Search'
		name: 'text_search'

	queryData: ->
		attrs = _.extend {}, @attributes

		delete attrs.name
		delete attrs.title

		attrs

module.exports = Search

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