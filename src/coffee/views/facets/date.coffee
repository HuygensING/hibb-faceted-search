Models =
  Date: require '../../models/facets/date'

Views = 
  Facet: require './main'

# Templates =
# 	Date: require 'text!html/facet/date.html'

tpl = require '../../../jade/facets/date.jade'

class DateFacet extends Views.Facet

  className: 'facet date'

  initialize: (options) ->
    super

    @model = new Models.Date options.attrs, parse: true
    @listenTo @model, 'change:options', @render
    @render()

  render: ->
    super

    rtpl = tpl _.extend @model.attributes,
      ucfirst: (str) -> str.charAt(0).toUpperCase() + str.slice(1)
    @$('.placeholder').html rtpl

    @

  update: (newOptions) ->
  reset: ->

module.exports = DateFacet