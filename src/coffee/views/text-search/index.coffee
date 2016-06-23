Backbone = require 'backbone'
_ = require 'underscore'

SearchModel = require '../../models/search'

tpl = require './index.jade'

funcky = require('funcky.util')

###
# @class
# @namespace Views
# @uses Config
# @uses SearchModel
###
class TextSearch extends Backbone.View

	className: 'text-search'

	###
	# The current field to search in.
	#
	# @property
	# @type {String}
	###
	currentField: ""

	###
	# @method
	# @construct
	# @param {Object} this.options
	# @param {Config} this.options.config
	###
	initialize: (@options) ->
		@setModel()

	###
	# @method
	# @chainable
	# @return {TextSearch}
	###
	render: ->
		tpl = @options.config.get('templates')['text-search'] if @options.config.get('templates').hasOwnProperty 'text-search'
		@$el.html tpl
			model: @model
			# options: @options.config.get('textSearchOptions')
			config: @options.config
			generateId: funcky.generateID
			currentField: @currentField

		@

	###
	# @method
	# @return {Object}
	###
	events: ->
		'click i.fa-search': 'search'
		'keyup input[name="search"]': 'onKeyUp'
		'focus input[name="search"]': -> @$('.body .menu').slideDown(150)
		'click .menu .fa-times': -> @$('.body .menu').slideUp(150)
		'change input[type="checkbox"]': 'checkboxChanged'
		'change input[type="radio"]': 'checkboxChanged'

	###
	# @method
	# @private
	###
	_addFullTextSearchParameters: ->
		ftsp = @options.config.get('textSearchOptions').fullTextSearchParameters

		if ftsp?
			@currentField = ftsp[0]

			params = []
			for param in ftsp
				params.push
					name: param
					term: "*"

			@model.set fullTextSearchParameters: params

	_parseTextSearchOptions: (options) ->
		attrs = _.clone options

		if options.caseSensitive
			attrs.caseSensitive = false
		else
			delete attrs.caseSensitive

		if options.fuzzy
			attrs.fuzzy = false
		else
			delete attrs.fuzzy

		attrs

	###
	# @method
	###
	setModel: ->
		@stopListening @model if @model?

		textSearchOptions = @_parseTextSearchOptions @options.config.get('textSearchOptions')
		@model = new SearchModel textSearchOptions

		@listenTo @options.config, "change:textSearchOptions", (config, textSearchOptions, options) =>
			@model.set @_parseTextSearchOptions textSearchOptions

			fullTextSearchParameters = @options.config.get('textSearchOptions').fullTextSearchParameters
			if fullTextSearchParameters?
				@currentField = fullTextSearchParameters[0]

				params = []
				for param in fullTextSearchParameters
					params.push
						name: param
						term: "*"

				@model.set fullTextSearchParameters: params

			@render()

	###
	# @method
	# @private
	###
	_updateFullTextSearchParameters: ->
		parameter =
			name: @currentField
			term: @el.querySelector('input[name="search"]').value

		@model.set fullTextSearchParameters: [parameter]

	###
	# @method
	# @private
	###
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
			@_updateFullTextSearchParameters()

		@updateQueryModel()

	###
	# @method
	# @param {Object} ev The event object.
	###
	checkboxChanged: (ev) ->
		dataAttr = ev.currentTarget.getAttribute('data-attr')
		dataAttrArray = ev.currentTarget.getAttribute('data-attr-array')

		if attr = dataAttr
			if attr is 'searchInTranscriptions'
				@$('ul.textlayers').toggle ev.currentTarget.checked
			@model.set attr, ev.currentTarget.checked
		else if dataAttrArray is 'fullTextSearchParameters'
			# Get the checked radio button
			for cb in @el.querySelectorAll '[data-attr-array="fullTextSearchParameters"]' when cb.checked
				# The field name is in the data-value attribute.
				@currentField = cb.getAttribute('data-value')

			@_updateFullTextSearchParameters()

		else if dataAttrArray?
			checkedArray = []
			for cb in @el.querySelectorAll "[data-attr-array=\"#{dataAttrArray}\"]" when cb.checked
				checkedArray.push cb.getAttribute('data-value')
			@model.set dataAttrArray, checkedArray

		@updateQueryModel()

	###
	# @method
	###
	search: (ev) ->
		ev.preventDefault()
		@trigger 'search'

	###
	# @method
	###
	updateQueryModel: ->
		@trigger 'change', @model.attributes

	###
	# @method
	###
	reset: ->
		@setModel()
		@render()

	###
	# @method
	###
	destroy: ->
		@remove()

module.exports = TextSearch
