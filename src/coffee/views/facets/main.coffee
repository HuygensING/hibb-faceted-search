Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

tpl = require '../../../jade/facets/main.jade'

###
# @class
# @abstract
# @namespace Views
###
class FacetView extends Backbone.View

	###
	# @method
	# @construct
	# @override
	# @param {Object} options
	###
	initialize: (options) ->
		@config = options.config

		# Override the facet title if the user has given an alternative title in the config.
		options.attrs.title = @config.get('facetDisplayNames')[options.attrs.name] if @config.get('facetDisplayNames').hasOwnProperty options.attrs.name

	###
	# @method
	# @override
	# @return {FacetView} Instance of FacetView to enable chaining.
	###
	render: ->
		tpl = @config.get('templates')['facets.main'] if @config.get('templates').hasOwnProperty 'facets.main'
		@$el.html tpl
			model: @model
			config: @config

		@$el.attr 'data-name', @model.get('name')

		@

	###
	# @property
	# @override
	# @type {Object}
	###
	events: ->
		'click h3': '_toggleBody'

	###
	# This method is called when the facet has to be updated. For instance after
	# the server has returned with new values.
	#
	# @method
	# @abstract
	# @param {Object} newOptions
	###
	update: (newOptions) ->

	###
	# Reset the facet to it's initial state.
	#
	# @method
	# @abstract
	###
	reset: ->

	###
	# The postRender method is being run after render.
	#
	# @method
	# @abstract
	###
	postRender: ->

	###
	# @method
	# @private
	# @param {Object} facetData
	# @return {Object} Parsed facet data
	###
	parseFacetData: (facetData) ->
		parsers = @options.config.get('parsers')

		if parsers.hasOwnProperty facetData.name
			facetData = parsers[facetData.name] facetData

		facetData

	###
	# Every facet can be minimized by clicking the title of the facet.
	#
	# @method
	# @private
	# @param {Object} ev The event object.
	###
	_toggleBody: (ev) ->
		func = if @$('.body').is(':visible') then @hideBody else @showBody

		# If ev is a function, than it is the callback. Use call to pass the context.
		if _.isFunction ev then func.call @, ev else func.call @

	###
	# @method
	# @private
	###
	_hideMenu: ->
		$button = @$ 'header i.openclose'
		$button.addClass 'fa-plus-square-o'
		$button.removeClass 'fa-minus-square-o'

		@$('header .options').slideUp(150)

	###
	# @method
	###
	collapse: ->
		@_hideMenu()
		@$('header i.fa').hide()
		@$('.body').hide()

	###
	# @method
	# @param {Function} done Callback called when hide body animation has finished.
	###
	hideBody: (done) ->
		@_hideMenu()

		@$('.body').slideUp 100, =>
			done() if done?
			@$('header i.fa').fadeOut 100

	###
	# @method
	# @param {Function} done Callback called when show body animation has finished.
	###
	showBody: (done) ->
		@$('.body').slideDown 100, =>
			done() if done?
			@$('header i.fa').fadeIn 100

	###
	# If destroy is not overridden, just call Backbone.View's remove method.
	#
	# @method
	###
	destroy: ->
		@remove()

module.exports = FacetView
