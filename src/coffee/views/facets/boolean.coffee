$ = require 'jquery'
_ = require 'underscore'

StringFn = require 'hilib/src/utils/string'

Models =
	Boolean: require '../../models/boolean'

Views = 
	Facet: require './main'

# Templates =
# 	Body: require 'text!html/facet/boolean.body.html'
bodyTpl = require '../../../jade/facets/boolean.body.jade'

class BooleanFacet extends Views.Facet

	className: 'facet boolean'

	# ### Initialize
	initialize: (options) ->
		super

		@model = new Models.Boolean options.attrs, parse: true
		@listenTo @model, 'change:options', @render

		@render()

	# ### Render
	render: ->
		super

		rtpl = bodyTpl _.extend @model.attributes, ucfirst: StringFn.ucfirst
		@$('.body').html rtpl

		@$('header i.fa').remove()

		@

	# ### Events
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

	# ### Methods
	update: (newOptions) -> @model.set 'options', newOptions
	reset: -> @render()

module.exports = BooleanFacet