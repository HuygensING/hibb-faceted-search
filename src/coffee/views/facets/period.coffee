define (require) ->
	Backbone = require 'backbone'
	$ = Backbone.$

	Models =
		Period: require 'models/period'
	Views = 
		Facet: require 'views/facets/main'
	
	templates = require 'tpls'

	class PeriodFacet extends Views.Facet
		className: 'facet period'
		events: ->
			'click h3': 'toggleBody'
			'click header small': 'toggleOptions'
			'change select': 'changePeriod'
			'change input[type=checkbox]': 'changeIncludeDateless'

		toggleOptions: (ev) ->
			@$('.options').slideToggle()

		toggleBody: (ev) ->
			$(ev.currentTarget).parents('.facet').find('.body').slideToggle()

		changeIncludeDateless: (e) ->
			if e.currentTarget.checked
				@trigger 'change',
					facetValue:
						name: @model.get 'name'
						values: []

		changePeriod: ->
			@$('input').prop('checked', false)

			start = @$('select').eq(0).val()
			end   = @$('select').eq(1).val()

			periods = @model.find(start, end)
			@trigger 'change',
				facetValue:
					name: @model.get 'name'
					values: periods

		initialize: (options) ->
			super

			@model = new Models.Period options.attrs, parse: true
			@listenTo @model, 'change:options', @render
			@render()

		render: ->
			super

			rtpl = templates['faceted-search/facets/period'] @model.attributes
			@$('.placeholder').html rtpl

			@

		update: (newOptions) ->

		reset: ->
			@$('select option:selected').prop 'selected', false
			@$('select option:first-child').prop 'selected', true