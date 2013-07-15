define (require) ->

	Fn = require 'helpers/fns'

	Models =
		query: require 'models/query'
		List: require 'models/list'

	Collections = 
		Options: require 'collections/list.items'

	Views = 
		Facet: require 'views/facet'
		Options: require 'views/facets/list.options'

	Templates =
		List: require 'text!html/facet/list.html'
		Items: require 'text!html/facet/list.items.html'

	class ListFacet extends Views.Facet

		checked: []

		filtered_items: []

		className: 'facet list'

		events: ->
			'click li.all': 'selectAll'
			'click li.none': 'deselectAll'
			'click h3': 'toggleBody'
			'keyup input.listsearch': (ev) -> @optionsView.filterOptions ev.currentTarget.value
			# 'change input[type="checkbox"]': 'checkChanged'

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.list').find('.body').slideToggle()

		selectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = true for cb in checkboxes

		deselectAll: ->
			checkboxes = @el.querySelectorAll('input[type="checkbox"]')
			cb.checked = false for cb in checkboxes

		# 	value = ev.currentTarget.value
		# 	re = new RegExp value, 'i'
		# 	@filtered_items = @model.get('options').filter (item) ->
		# 		re.test item.get('name')
		# 	@renderListItems()

		# checkChanged: (ev) ->
		# 	console.log @model.get 'options'
		# 	@checked.length = 0
		# 	@checked.push checkbox.getAttribute 'data-value' for checkbox in @el.querySelectorAll('input[type="checkbox"]:checked') # Is looping over all checked more efficient than toggling value in array?

		# 	# Deepcopy data, otherwise values is passed by reference
		# 	data = Fn.deepCopy
		# 		name: @model.get 'name'
		# 		values: @checked
				
		# 	@publish 'facet:list:changed', data

		initialize: (options) ->
			super

			@model = new Models.List options.attrs
			@collection = new Collections.Options options.attrs.options, parse: true

			@render()

		render: ->
			super

			rtpl = _.template Templates.List, @model.attributes
			@$('.placeholder').html rtpl

			@optionsView = new Views.Options
				el: @$('.items')
				collection: @collection

			@listenTo @optionsView, 'filter:finished', @renderFilteredOptionCount
			@listenTo @collection, 'change:checked', @optionChecked

		optionChecked: ->
			checked = []
			@optionsView.collection.each (model) -> checked.push model.id if model.get 'checked'

			@publish 'facet:list:changed',
				name: @model.get 'name'
				values: checked

		renderFilteredOptionCount: ->
			filteredLength = @optionsView.filtered_items.length
			collectionLength = @optionsView.collection.length

			if filteredLength is 0 or filteredLength is collectionLength
				@$('header small').html ''
			else
				@$('header small').html filteredLength + ' of ' + collectionLength

			@

		update: (attrs) -> @optionsView.collection.updateOptions(attrs.options)
			# @model.updateOptions attrs
			# console.log _.clone(@model.attributes)
			# @renderListItems()

		# renderListItems: ->
		# 	items = if @filtered_items.length > 0 then @filtered_items else @model.get('options').models

		# 	rtpl = _.template Templates.Items, 
		# 		model: @model.attributes
		# 		items: items
		# 		generateID: Fn.generateID

		# 	@$('.body .items ul').html rtpl

		# 	@recheckCheckboxes()

		# ###
		# When the list is re-rendered, the checkboxes are unchecked
		# ###
		# recheckCheckboxes: ->
		# 	checkedOptions = Models.query.facetValues[@model.id]
		# 	if checkedOptions?
		# 		_.each checkedOptions.values, (value) =>
		# 			@$('input[data-value="'+value+'"]').prop 'checked', true