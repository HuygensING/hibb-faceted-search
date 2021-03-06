$ = require 'jquery'
_ = require 'underscore'

Models =
	Boolean: require '../../models/facets/boolean'

Views = 
	Facet: require './main'

# Templates =
# Body: require 'text!html/facet/boolean.body.html'
bodyTpl = require '../../../jade/facets/boolean.body.jade'

###
# @class
# @namespace Views
###
class BooleanFacet extends Views.Facet

	###
	# @property
	# @type {String}
	###
	className: 'facet boolean'

	# ### Initialize
	initialize: (@options) ->
		super
	
		facetData = @parseFacetData @options.attrs
		@model = new Models.Boolean facetData, parse: true
		@listenTo @model, 'change:options', @render

		@render()

	# ### Render
	render: ->
		super

		rtpl = bodyTpl _.extend @model.attributes,
			ucfirst: (str) -> str.charAt(0).toUpperCase() + str.slice(1)
		@$('.body').html rtpl

		@$('header i.fa').remove()

		@

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

	update: (newOptions) ->
		facetData = @parseFacetData
			name: @options.attrs.name
			options: newOptions

		@model.set 'options', facetData.options
	
	reset: ->
		@render()

module.exports = BooleanFacet
