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

		# ### Initialize
		initialize: (options) ->
			super

			@currentSearchText = null

			@model = new Models.Search 
				searchOptions: config.textSearchOptions
				title: 'Text search'
				name: 'text_search'

			@render()

		# * TODO: search input (<input id="">) should not have an ID, because there can be several Faceted Search instances.
		# ### Render
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
					# console.log prop
					if prop?
						checked = if $(cb).attr('checked') is 'checked' then true else false
						# console.log cb.checked
						@model.set prop, checked

				# console.log @model.attributes

			@

		# ### Events
		events: -> _.extend {}, super,
			'click button': (ev) -> ev.preventDefault()
			'click button.active': 'search'
			'keyup input': 'onKeyup'

		onKeyup: (ev) ->
			if ev.currentTarget.value.length > 1 and @currentSearchText isnt ev.currentTarget.value
				@$('button').addClass 'active'
			else
				@$('button').removeClass 'active'

		search: (ev) ->
			ev.preventDefault()

			# Prevent user from searching the same query twice
			@$('button').removeClass 'active'
			$search = @$('#search')
			$search.addClass 'loading'

			# The currentSearchText can never be equal to the input value, because if it was,
			# the search button would not be clickable.
			@currentSearchText = $search.val()

			@trigger 'change', term: @currentSearchText
				# textLayers: ['Diplomatic']

		# ### Methods
		update: -> @$('#search').removeClass 'loading'
