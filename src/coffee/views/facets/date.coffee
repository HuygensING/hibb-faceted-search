define (require) ->

	StringFn = require 'helpers/string'

	Models =
		Date: require 'models/date'

	Views = 
		Facet: require 'views/facet'

	Templates =
		Date: require 'text!html/facet/date.html'

	class DateFacet extends Views.Facet

		className: 'facet date'

		initialize: (options) ->
			super

			@model = new Models.Date options.attrs, parse: true
			@listenTo @model, 'change:options', @render
			console.log @model
			@render()

		render: ->
			super

			rtpl = _.template Templates.Date, _.extend @model.attributes, ucfirst: StringFn.ucfirst
			@$('.placeholder').html rtpl

			@

		update: (newOptions) ->