define (require) ->

	Views = 
		Base: require 'views/base'

	# Templates =
	# 	Facet: require 'text!html/facet.html'
	tpls = require 'tpls'
	

	class Facet extends Views.Base

		initialize: ->
			super

		events: ->
			'click h3': 'toggleBody'
			'click header small': 'toggleOptions'

		toggleOptions: (ev) ->
			@$('header small').toggleClass('active')
			@$('header .options').slideToggle()
			@$('header .options input[name="filter"]').focus()

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		render: ->
			rtpl = tpls['faceted-search/facets/main']  @model.attributes
			@$el.html rtpl

			@

		# Override in child
		update: (newOptions) -> # console.log newOptions