FacetModel = require './main'
_ = require 'underscore'

class RangeFacet extends FacetModel

  defaults: -> _.extend {}, super,
    min: null
    max: null
    currentMin: null
    currentMax: null

  set: (attrs, options) ->
    if attrs.hasOwnProperty 'currentMin'
      if attrs.currentMin > @get('currentMax')
        attrs.currentMax = +attrs.currentMin
        attrs.currentMin = @get 'currentMax'

    if attrs.hasOwnProperty 'currentMax'
      if attrs.currentMax < @get('currentMin')
        attrs.currentMin = +attrs.currentMax
        attrs.currentMax = @get 'currentMin'

    # The new currentMin can't be smaller than the initial min.
    if attrs.hasOwnProperty('currentMin') and attrs.currentMin < @get('min')
      attrs.currentMin = @get 'min'

    # The new currentMax can't be bigger than the initial max.
    if attrs.hasOwnProperty('currentMax') and attrs.currentMax > @get('max')
      attrs.currentMax = @get 'max'

    super


  parse: (attrs) ->
    super

    attrs.options =
      lowerLimit: +((attrs.options[0].lowerLimit+'').substr(0, 4))
      upperLimit: +((attrs.options[0].upperLimit+'').substr(0, 4))

    attrs.min = attrs.currentMin = attrs.options.lowerLimit
    attrs.max = attrs.currentMax = attrs.options.upperLimit

    attrs

module.exports = RangeFacet