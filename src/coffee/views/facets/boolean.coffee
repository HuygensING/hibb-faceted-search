define (require) ->

	StringFn = require 'helpers/string'

	Models =
		Boolean: require 'models/boolean'

	Views = 
		Facet: require 'views/facet'

	Templates =
		List: require 'text!html/facet/boolean.html'

	class BooleanFacet extends Views.Facet

		className: 'facet boolean'

		events: ->
			'change input[type="checkbox"]': 'checkChanged'
			'click h3': 'toggleBody'

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

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

			rtpl = _.template Templates.List, _.extend @model.attributes, ucfirst: StringFn.ucfirst
			@$('.placeholder').html rtpl

			@

		update: (newOptions) -> @model.set 'options', newOptions