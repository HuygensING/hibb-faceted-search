define (require) ->

	StringFn = require 'hilib/functions/string'

	Models =
		Date: require 'models/date'

	Views = 
		Facet: require 'views/facets/main'

	# Templates =
	# 	Date: require 'text!html/facet/date.html'

	tpls = require 'tpls'

	class DateFacet extends Views.Facet

		className: 'facet date'

		initialize: (options) ->
			super

			@model = new Models.Date options.attrs, parse: true
			@listenTo @model, 'change:options', @render
			@render()

		render: ->
			super

			rtpl = tpls['faceted-search/facets/date']  _.extend @model.attributes, ucfirst: StringFn.ucfirst
			@$('.placeholder').html rtpl

			@

		update: (newOptions) ->
		reset: ->