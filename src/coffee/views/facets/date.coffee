StringFn = require 'hilib/compiled/functions/string'

Models =
	Date: require '../../models/date'

Views = 
	Facet: require './main'

# Templates =
# 	Date: require 'text!html/facet/date.html'

tpl = '../../../jade/facets/date.jade'

class DateFacet extends Views.Facet

	className: 'facet date'

	initialize: (options) ->
		super

		@model = new Models.Date options.attrs, parse: true
		@listenTo @model, 'change:options', @render
		@render()

	render: ->
		super

		rtpl = tpl _.extend @model.attributes, ucfirst: StringFn.ucfirst
		@$('.placeholder').html rtpl

		@

	update: (newOptions) ->
	reset: ->

module.exports = DateFacet