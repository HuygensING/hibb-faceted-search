define (require) ->

	Views = 
		Base: require 'views/base'

	Templates =
		Facet: require 'text!html/modules/faceted-search/facet.html'

	class Facet extends Views.Base

		# initialize: ->
		# 	super

		render: ->
			rtpl = _.template Templates.Facet
			@$el.html rtpl

			@