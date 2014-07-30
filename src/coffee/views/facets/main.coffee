Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

tpl = require '../../../jade/facets/main.jade'

class Facet extends Backbone.View

  # ### Initialize
  initialize: (options) ->
    @config = options.config

    # Override the facet title if the user has given an alternative title in the config.
    options.attrs.title = @config.get('facetTitleMap')[options.attrs.name] if @config.get('facetTitleMap').hasOwnProperty options.attrs.name

  # ### Render
  render: ->
    tpl = @config.get('templates')['facets.main'] if @config.get('templates').hasOwnProperty 'facets.main'
    @$el.html tpl @model.attributes

    @$el.attr 'data-name', @model.get('name')

    @

  # ### Events
  events: ->
    'click h3': 'toggleBody'

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