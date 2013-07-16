define (require) ->
	# Models = 
 #    	query: require 'models/query'

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

			Models.query.set 'term', @$('input#search').val()
			Models.query.set 'textLayers', ['Diplomatic']
			Models.query.fetch()

			@subscribe 'faceted-search:results', (results) =>
				@$('#search').removeClass 'loading'


		initialize: ->
			super

			@render()

		render: ->
			super

			rtpl = _.template Templates.Search
			@$('.placeholder').html rtpl

			@