Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

tpl = require '../../../jade/facets/main.jade'

class Facet extends Backbone.View
	renderedBefore: false

	# ### Initialize
	initialize: (options) ->
	   @config = options.config

	# Override the facet title if the user has given an alternative title in the config.
	options.attrs.title = @config.get('facetTitleMap')[options.attrs.name] if @config.get('facetTitleMap').hasOwnProperty options.attrs.name

	# ### Render
	render: ->
		tpl = @config.get('templates')['facets.main'] if @config.get('templates').hasOwnProperty 'facets.main'
		@$el.html tpl @model.attributes

		if @model.get('collapsed') and not @renderedBefore
			@hideBody()

		@renderedBefore = true
		@$el.attr 'data-name', @model.get('name')

		@

	# ### Events
	events: ->
		'click h3': 'toggleBody'

	toggleBody: (ev) ->
		func = if @$el.hasClass 'collapsed' then @showBody else @hideBody

		# If ev is a function, than it is the callback. Use call to pass the context.
		if _.isFunction ev then func.call @, ev else func.call @

	# ### Methods
	hideMenu: ->
		$button = @$ 'header i.openclose'
		$button.addClass 'fa-plus-square-o'
		$button.removeClass 'fa-minus-square-o'

		@$('header .options').slideUp(150)

	hideBody: (done) ->
		@hideMenu()

		@$('.body').one 'transitionend', ->
			done() if done?

		@$el.addClass 'collapsed'


	showBody: (done) ->
		@$el.removeClass 'collapsed'
		@$('.body').one 'transitionend', ->
			done() if done?

	destroy: -> @remove()
	
	# NOOP: Override in child
	update: (newOptions) -> # console.log newOptions
	reset: ->


module.exports = Facet