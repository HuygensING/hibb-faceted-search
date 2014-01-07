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
			'click header svg': 'toggleOptions'

		toggleOptions: (ev) ->
			# Use native, because jQuery toggleClass doesn't work on SVG
			svg = @el.querySelector 'header svg'
			if svg.hasAttribute('class') then svg.removeAttribute('class') else svg.setAttribute 'class', 'active'

			@$('header .options').slideToggle(150)
			@$('header .options input[name="filter"]').focus()

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		render: ->
			# console.log @model.attributes
			rtpl = tpls['faceted-search/facets/main']  @model.attributes
			@$el.html rtpl

			@

		# Override in child
		update: (newOptions) -> # console.log newOptions