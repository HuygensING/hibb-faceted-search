define (require) ->

	Fn = require 'helpers/general'

	Models =
		List: require 'models/list'

	Collections = 
		Options: require 'collections/list.options'

	Views = 
		Facet: require 'views/facet'
		Options: require 'views/facets/list.options'

	Templates =
		Menu: require 'text!html/facet/list.menu.html'
		Body: require 'text!html/facet/list.body.html'

	class ListFacet extends Views.Facet

		checked: []

		filtered_items: []

		className: 'facet list'

		events: -> _.extend {}, super,
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'keyup input.listsearch': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			# 'click h3': 'toggleBody'
			# 'click header small': 'toggleOptions'


		# toggleOptions: (ev) ->
		# 	@$('header small').toggleClass('active')
		# 	@$('header .options').slideToggle()
		# 	@$('.options .listsearch').focus()

		# toggleBody: (ev) ->
		# 	$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		selectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = true for cb in checkboxes

		deselectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = false for cb in checkboxes

		initialize: (options) ->
			super

			@model = new Models.List options.attrs, parse: true
			@collection = new Collections.Options options.attrs.options, parse: true

			@render()

		render: ->
			super

			menu = _.template Templates.Menu, @model.attributes
			body = _.template Templates.Body, @model.attributes
			@$('.options').html menu
			@$('.body').html body

			@optionsView = new Views.Options
				el: @$('.body .options')
				collection: @collection
				facetName: @model.get 'name'

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			@listenTo @optionsView, 'change', (data) => @trigger 'change', data # Trigger optionsView change event on this object

			@

		# Renders the count of the filtered options next to the facets title
		renderFilteredOptionCount: ->
			filteredLength = @optionsView.filtered_items.length
			collectionLength = @optionsView.collection.length

			if filteredLength is 0 or filteredLength is collectionLength
				@$('header .options .listsearch').addClass 'nonefound'
				@$('header small.optioncount').html ''
			else
				@$('header .options .listsearch').removeClass 'nonefound'
				@$('header small.optioncount').html filteredLength + ' of ' + collectionLength

			@

		update: (newOptions) ->
			# console.log @model.get('name')
			# if @model.get('name') is 'facet_s_subject'
			# 	console.log @collection
			# 	console.log newOptions

			@collection.updateOptions(newOptions)