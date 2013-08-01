define (require) ->
	config = require 'config'

	Models =
		Search: require 'models/search'

	Views = 
		Facet: require 'views/facet'

	Templates =
		Menu: require 'text!html/facet/search.menu.html'
		Body: require 'text!html/facet/search.body.html'

	class Search extends Views.Facet

		className: 'facet search'

		events: -> _.extend {}, super,
			'click button.search': 'search'

		search: (ev) ->
			ev.preventDefault()

			@$('#search').addClass 'loading'

			@trigger 'change', 
				term: @$('#search').val()
				# textLayers: ['Diplomatic']

			@subscribe 'results:change', => @$('#search').removeClass 'loading'

		initialize: (options) ->
			super

			@model = new Models.Search 
				searchOptions: config.textSearchOptions
				title: 'Text search'
				name: 'text_search'

			@render()

		render: ->
			super

			menu = _.template Templates.Menu, @model.attributes
			body = _.template Templates.Body, @model.attributes

			@$('.options').html menu
			@$('.body').html body

			checkboxes = @$(':checkbox')
			checkboxes.change (ev) =>
				_.each checkboxes, (cb) =>
					prop = cb.getAttribute 'data-prop'
					console.log prop
					if prop?
						checked = if $(cb).attr('checked') is 'checked' then true else false
						console.log cb.checked
						@model.set prop, checked

				console.log @model.attributes

			@