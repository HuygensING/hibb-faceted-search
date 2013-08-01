define (require) ->

	StringFn = require 'helpers/string'

	Models =
		Boolean: require 'models/boolean'

	Views = 
		Facet: require 'views/facet'

	Templates =
		Body: require 'text!html/facet/boolean.body.html'

	class BooleanFacet extends Views.Facet

		className: 'facet boolean'

		events: -> _.extend {}, super,
			'change input[type="checkbox"]': 'checkChanged'
			# 'click h3': 'toggleBody'

		checkChanged: (ev) ->
			@trigger 'change',
				facetValue:
					name: @model.get 'name'
					values: _.map @$('input:checked'), (input) -> input.getAttribute 'data-value'

		initialize: (options) ->
			super

			@model = new Models.Boolean options.attrs, parse: true
			@listenTo @model, 'change:options', @render

			@render()

		render: ->
			super

			rtpl = _.template Templates.Body, _.extend @model.attributes, ucfirst: StringFn.ucfirst
			@$('.body').html rtpl

			@$('header small').hide()

			@

		update: (newOptions) -> @model.set 'options', newOptions