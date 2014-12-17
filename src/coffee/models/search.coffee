Backbone = require 'backbone'
_ = require 'underscore'

class Search extends Backbone.Model

	defaults: ->
		# term: '*'
		# title: 'Text Search'
		# name: 'text_search'

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