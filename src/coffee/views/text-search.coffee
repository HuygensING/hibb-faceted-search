Backbone = require 'backbone'
_ = require 'underscore'

Models =
	Search: require '../models/search'

tpl = require '../../jade/text-search.jade'

funcky = require('funcky.util')

class TextSearch extends Backbone.View

	className: 'text-search'

	# ### Initialize
	initialize: (@options) ->
		@setModel()

	_addFullTextSearchParameters: ->
		ftsp = @options.config.get('textSearchOptions').fullTextSearchParameters

		if ftsp?
			params = []
			for param in ftsp
				params.push
					name: param
					term: "*"

			@model.set fullTextSearchParameters: params

	setModel: ->
		@stopListening @model if @model?

		textSearchOptions = @options.config.get('textSearchOptions')

		attrs = _.clone textSearchOptions
		if textSearchOptions.caseSensitive
			attrs.caseSensitive = false
		else
			delete attrs.caseSensitive

		if textSearchOptions.fuzzy
			attrs.fuzzy = false
		else
			delete attrs.fuzzy

		@model = new Models.Search attrs
		@_addFullTextSearchParameters()

		@listenTo @options.config, "change:textSearchOptions", =>
			@_addFullTextSearchParameters()
			@render()

		# @listenTo @options.config, "change:textSearchOptions", =>
		#   console.log 'change text search options'

		# console.log @options.config.get('textSearchOptions').fullTextSearchParameters

	# ### Render
	render: ->
		tpl = @options.config.get('templates')['text-search'] if @options.config.get('templates').hasOwnProperty 'text-search'
		@$el.html tpl
			model: @model
			# options: @options.config.get('textSearchOptions')
			config: @options.config
			generateId: funcky.generateID

		@

	# ### Events
	events: ->
		'click i.fa-search': 'search'
		'keyup input[name="search"]': 'onKeyUp'
		'focus input[name="search"]': -> @$('.body .menu').slideDown(150)
		'click .menu .fa-times': -> @$('.body .menu').slideUp(150)
		'change input[type="checkbox"]': 'checkboxChanged'

	onKeyUp: (ev) ->
		if ev.keyCode is 13
			ev.preventDefault()
			return @search ev

		# The term can be passed to 
		if @model.has('term')
			# Update the mainModel (queryOptions) silently. We want to set the term
			# to the mainModel. When autoSearch is off and the user wants to
			# perform a search, the term is known to the queryModel.
			if @model.get('term') isnt ev.currentTarget.value
				@model.set term: ev.currentTarget.value
		else
			clone = _.clone @model.get('fullTextSearchParameters')
			for field in clone
				field.term = ev.currentTarget.value
			@model.set fullTextSearchParameters: clone

		@updateQueryModel()

	checkboxChanged: (ev) ->
		dataAttr = ev.currentTarget.getAttribute('data-attr')
		dataAttrArray = ev.currentTarget.getAttribute('data-attr-array')

		if attr = dataAttr
			if attr is 'searchInTranscriptions'
				@$('ul.textlayers').toggle ev.currentTarget.checked
			@model.set attr, ev.currentTarget.checked
		else if dataAttrArray is 'fullTextSearchParameters'
			checkedArray = []
			for cb in @el.querySelectorAll '[data-attr-array="fullTextSearchParameters"]' when cb.checked
				checkedArray.push
					name: cb.getAttribute('data-value')
					term: @$('input[name="search"]').val()
			@model.set dataAttrArray, checkedArray
		else if dataAttrArray?
			checkedArray = []
			for cb in @el.querySelectorAll "[data-attr-array=\"#{dataAttrArray}\"]" when cb.checked
				checkedArray.push cb.getAttribute('data-value')
			@model.set dataAttrArray, checkedArray

		@updateQueryModel()
		# else
		#   console.log attr
		# console.log @model.attributes
		# @updateQueryModel()

	search: (ev) ->
		ev.preventDefault()
		@trigger 'search'

	# ### Methods
	updateQueryModel: ->
		@trigger 'change', @model.attributes

	reset: ->
		@setModel()
		@render()

	destroy: -> @remove()

module.exports = TextSearch