define (require) ->
	Models = 
        Main: require 'models/main'

	Views = 
		Facet: require 'views/facet'

	Templates =
		Search: require 'text!html/search.html'

	class Search extends Views.Facet

		className: 'facet search'

		events:
			'click button.search': 'search'

		search: (ev) ->
			ev.preventDefault()

			@$('#search').addClass 'loading'

			@model.query
				term: @$('input#search').val()
				textLayers: ['Diplomatic']
			,
				(results) =>
					# TODO: Update facets
					@$('#search').removeClass 'loading'
					@publish 'faceted-search:results', results

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


		initialize: ->
			super

			@model = Models.Main

			@render()

		render: ->
			super

			rtpl = _.template Templates.Search
			@$('.placeholder').html rtpl

			@