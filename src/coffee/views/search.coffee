define (require) ->
	config = require 'config'

	Models =
		Search: require 'models/search'

	Views = 
		Facet: require 'views/facets/main'

	# Templates =
	# 	Menu: require 'text!html/facet/search.menu.html'
	# 	Body: require 'text!html/facet/search.body.html'

	tpls = require 'tpls'

	class Search extends Views.Facet

		className: 'facet search'

		# ### Initialize
		initialize: (options) ->
			super

			@model = new Models.Search config.textSearchOptions
			@listenTo @model, 'change', => @trigger 'change', @model.queryData()

			@render()

		# * TODO: search input (<input id="">) should not have an ID, because there can be several Faceted Search instances.
		# ### Render
		render: ->
			super

			# menu = _.template Templates.Menu, @model.attributes
			menu = tpls['faceted-search/facets/search.menu'] model: @model
			body = tpls['faceted-search/facets/search.body'] model: @model


			@$('.options').html menu
			@$('.body').html body

			# checkboxes = @$(':checkbox')
			# checkboxes.change (ev) =>
			# 	_.each checkboxes, (cb) =>
			# 		prop = cb.getAttribute 'data-prop'
			# 		console.log prop
			# 		if prop?
			# 			checked = if $(cb).attr('checked') is 'checked' then true else false
			# 			# console.log cb.checked
			# 			@model.set prop, checked

				# console.log @model.attributes

			@

		# ### Events
		events: -> _.extend {}, super,
			'click button': (ev) -> ev.preventDefault()
			'click button.active': 'search'
			'keyup input': 'activateSearchButton'
			'change input[type="checkbox"]': 'checkboxChanged'

		checkboxChanged: (ev) -> 
			if attr = ev.currentTarget.getAttribute('data-attr')
				@model.set attr, ev.currentTarget.checked
			else if attr = ev.currentTarget.getAttribute('data-attr-array')
				checkedArray = []
				for cb in @el.querySelectorAll '[data-attr-array="'+attr+'"]' when cb.checked
					checkedArray.push cb.getAttribute('data-value')
				@model.set attr, checkedArray

			@activateSearchButton true

		activateSearchButton: (checkboxChanged=false) ->
			checkboxChanged = false if checkboxChanged.hasOwnProperty 'target'

			inputValue = @el.querySelector('input[name="search"]').value

			if inputValue.length > 1 and (@model.get('term') isnt inputValue or checkboxChanged)
				@$('button').addClass 'active'
			else
				@$('button').removeClass 'active'

		search: (ev) ->
			ev.preventDefault()

			# Prevent user from searching the same query twice
			@$('button').removeClass 'active'
			$search = @$('input[name="search"]')
			# * FIX: use classList polyfill
			$search.addClass 'loading'

			inputValue = @el.querySelector('input[name="search"]').value
			@model.set 'term', inputValue

			# # The currentSearchText can never be equal to the input value, because if it was,
			# # the search button would not be clickable.
			# @currentSearchText = inputValue

			# @trigger 'change', @searchData inputValue

		# ### Methods
		update: -> @$('input[name="search"]').removeClass 'loading'