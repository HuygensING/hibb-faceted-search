define (require) ->

	StringFn = require 'hilib/functions/string'

	Models =
		Boolean: require 'models/boolean'

	Views = 
		Facet: require 'views/facets/main'

	# Templates =
	# 	Body: require 'text!html/facet/boolean.body.html'
	tpls = require 'tpls'

	class BooleanFacet extends Views.Facet

		className: 'facet boolean'

		events: -> _.extend {}, super,
			'click i': 'checkChanged'
			'click label': 'checkChanged'
			# 'click h3': 'toggleBody'

		checkChanged: (ev) ->
			$target = if ev.currentTarget.tagName is 'LABEL' then @$ 'i[data-value="'+ev.currentTarget.getAttribute('data-value')+'"]' else $ ev.currentTarget

			$target.toggleClass 'fa-square-o'
			$target.toggleClass 'fa-check-square-o'

			value = $target.attr 'data-value'
			for option in @model.get('options')
				option.checked = $target.hasClass 'fa-check-square-o' if option.name is value
			# @collection.get(id).set 'checked', $target.hasClass 'fa-check-square-o'

			@trigger 'change',
				facetValue:
					name: @model.get 'name'
					values: _.map @$('i.fa-check-square-o'), (cb) -> cb.getAttribute 'data-value'

		initialize: (options) ->
			super

			@model = new Models.Boolean options.attrs, parse: true
			@listenTo @model, 'change:options', @render

			@render()

		render: ->
			super

			rtpl = tpls['faceted-search/facets/boolean.body'] _.extend @model.attributes, ucfirst: StringFn.ucfirst
			@$('.body').html rtpl

			@$('header svg').remove()

			@

		update: (newOptions) -> @model.set 'options', newOptions
		reset: -> @render()