FacetModel = require './main'
_ = require 'underscore'

class RangeFacet extends FacetModel

  defaults: -> _.extend {}, super,
    currentMin: null
    currentMax: null

  parse: (attrs) ->
    super

    attrs.options =
      lowerLimit: +((attrs.options[0].lowerLimit+'').substr(0, 4))
      upperLimit: +((attrs.options[0].upperLimit+'').substr(0, 4))
    attrs

module.exports = RangeFacet