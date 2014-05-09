Backbone = require 'backbone'
_ = require 'underscore'

dom = require 'hilib/src/utils/dom'

config = require '../config'

Models =
	Search: require '../models/search'

Views = 
	Facet: require './facets/main'

tpl = require '../../jade/facets/search.jade'

class TextSearch extends Backbone.View

	className: 'text-search'

	# ### Initialize
	initialize: (options) ->
		# super

		@reset()

	setModel: ->
		@stopListening @model if @model?

		@model = new Models.Search config.textSearchOptions
		@listenTo @model, 'change', => @trigger 'change', @model.queryData()

	# * TODO: search input (<input id="">) should not have an ID, because there can be several Faceted Search instances.
	# ### Render
	render: ->
		tpl = config.templates['search'] if config.templates.hasOwnProperty 'search'
		@$el.html tpl model: @model

		@

	# ### Events
	events: ->
		# 'click button': (ev) -> ev.preventDefault()
		# 'click button.active': 'search'
		# 'click header i.openclose': 'toggleMenu'
		'click i.fa-search': 'search'
		'keyup input': 'onKeyUp'
		'focus input': -> @$('.body .menu').slideDown(150)
		'click .menu .fa-times': -> @$('.body .menu').slideUp(150)
		'change input[type="checkbox"]': 'checkboxChanged'

	onKeyUp: (ev) ->
		# Update the mainModel (queryOptions) silently. We want to set the term
		# to the mainModel. When autoSearch is set to false and the user wants to
		# perform a search, the term is known to the mainModel.
		if @model.get('term') isnt ev.currentTarget.value
			@model.set {term: ev.currentTarget.value}, {silent: true}
			@trigger 'change:silent', @model.queryData()

		if ev.keyCode is 13
			ev.preventDefault()
			@search ev

	# ### Show/hide menu/body
	# toggleMenu: (ev) ->
		# $button = $ ev.currentTarget
		# $button.toggleClass 'fa-plus-square-o'
		# $button.toggleClass 'fa-minus-square-o'

		

	checkboxChanged: (ev) ->
		if attr = ev.currentTarget.getAttribute('data-attr')
			if attr is 'searchInTranscriptions'
				@$('ul.textlayers').toggle ev.currentTarget.checked
			@model.set attr, ev.currentTarget.checked
		else if attr = ev.currentTarget.getAttribute('data-attr-array')
			checkedArray = []
			for cb in @el.querySelectorAll '[data-attr-array="'+attr+'"]' when cb.checked
				checkedArray.push cb.getAttribute('data-value')
			@model.set attr, checkedArray

		# @activateSearchButton true

	# activateSearchButton: (ev=false) ->
	# 	if ev.hasOwnProperty 'target'
	# 		ev.preventDefault()
	# 		checkboxChanged = false
	# 	else
	# 		checkboxChanged = ev

	# 	console.log ev.keyCode

	# 	inputValue = @el.querySelector('input[name="search"]').value

	# 	if inputValue.length > 1 and (@model.get('term') isnt inputValue or checkboxChanged)
	# 		@$('button').addClass 'active'
	# 	else
	# 		@$('button').removeClass 'active'

	search: (ev) ->
		ev.preventDefault()

		$search = @$('input[name="search"]')
		inputValue = $search.val()

		@model.set 'term', inputValue unless inputValue is ''

	# ### Methods
	update: -> @$('input[name="search"]').removeClass 'loading'
	
	reset: -> 
		@setModel()
		@render()

	destroy: -> @remove()

module.exports = TextSearch