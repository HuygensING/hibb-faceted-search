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
			# 'click header small': 'toggleOptions'
			'click button.search': 'search'
			# # 'click li.searchin': 'optionClicked'
			# # 'click li.textlayer': 'optionClicked'
			# 'click .casesensitive': 'optionClicked'
			# 'click ul li': 'optionClicked'

			

		# toggleOptions: (ev) ->
		# 	@$('.options').slideToggle()

		search: (ev) ->
			ev.preventDefault()

			@$('#search').addClass 'loading'

			@trigger 'change', 
				term: @$('#search').val()
				# textLayers: ['Diplomatic']

			@subscribe 'faceted-search:results', => @$('#search').removeClass 'loading'

		# optionClicked: (ev) ->
		# 	ev.stopPropagation()
		# 	console.log ev
		# 	console.log $('li.textlayer')

			# $textlayer_inputs = @$('.textlayer input')
			# $searchins = @$('.searchin')

			# if $textlayer_inputs.length
			# 	console.log $textlayer_inputs
			# 	# _.each textlayers, (tl) ->



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
				# _.each @$('[data-prop]')
				# @model.set 'caseSensitive', @$('[data-prop="caseSensitive"]').attr 'checked'
				# @model.set 'caseSensitive', @$('[data-prop="caseSensitive"]').attr 'checked'

			@