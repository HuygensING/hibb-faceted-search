define (require) ->
	Views = 
		Facet: require 'views/facet'

	Templates =
		Search: require 'text!html/search.html'

	class Search extends Views.Facet

		className: 'facet search'

		events:
			'click button.search': 'search'
			'click header small': 'toggleOptions'

		toggleOptions: (ev) ->
			@$('.options').slideToggle()

		search: (ev) ->
			ev.preventDefault()

			@$('#search').addClass 'loading'

			@trigger 'change', 
				term: @$('#search').val()
				textLayers: ['Diplomatic']

			@subscribe 'faceted-search:results', => @$('#search').removeClass 'loading'


		initialize: ->
			super

			@render()

		render: ->
			super

			rtpl = _.template Templates.Search
			@$('.placeholder').html rtpl

			@