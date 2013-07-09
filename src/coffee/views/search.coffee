define (require) ->
	Models = 
    	query: require 'models/query'

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

			Models.query.fetch
				term: @$('input#search').val()
				textLayers: ['Diplomatic']
			,
				(results) =>
					# TODO: Update facets
					@$('#search').removeClass 'loading'
					@publish 'faceted-search:results', results


		initialize: ->
			super

			@render()

		render: ->
			super

			rtpl = _.template Templates.Search
			@$('.placeholder').html rtpl

			@