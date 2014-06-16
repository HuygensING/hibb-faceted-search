$ = require 'jquery'
_ = require 'underscore'

config = require '../../config'

Models =
  Range: require '../../models/facets/range'

Views = 
  Facet: require './main'

bodyTpl = require '../../../jade/facets/range.body.jade'

class RangeFacet extends Views.Facet
  className: 'facet range'

  initialize: (options) ->

    @draggingMin = false
    @draggingMax = false

    @model = new Models.Range options.attrs, parse: true
    @listenTo @model, 'change:options', @render

    console.log @model.attributes

    @render()

  render: ->
    super

    bodyTpl = config.templates['range.body'] if config.templates.hasOwnProperty 'range.body'

    rtpl = bodyTpl @model.attributes
    @$('.body').html rtpl

    @$('header .menu').hide()

    setTimeout (=> @postRender()), 0

    @

  postRender: ->
    @$minHandle = @$('.min-handle')
    @$maxHandle = @$('.max-handle')
    @$bar = @$('.bar')

    @$slider = @$('.slider')
    @sliderWidth = @$slider.width()
    @sliderLeft = @$slider.offset().left

    @minHandleLeft = @$minHandle.offset().left
    @maxHandleLeft = @$maxHandle.offset().left

    # The assumption is made that the minHandle and maxHandle have an equal width
    @handleWidth = @$minHandle.width()

  events: ->
    'mousedown .handle': 'startDragging'
    'mouseup': 'stopDragging'
    'mousemove': 'drag'

  startDragging: (ev) ->
    target = $ ev.currentTarget

    if target.hasClass 'min-handle'
      @draggingMin = true
      @$maxHandle.css 'z-index', 10
    else if target.hasClass 'max-handle'
      @draggingMax = true
      @$minHandle.css 'z-index', 10

    target.css 'z-index', 11

  drag: (ev) ->
    mousePosLeft = ev.clientX - @sliderLeft

    if @draggingMin
      @minHandleLeft = mousePosLeft - (@handleWidth/2)

      if -1 < mousePosLeft <= @maxHandleLeft
        @$minHandle.css 'left', @minHandleLeft
        @$bar.css 'left', mousePosLeft
        @updateHandleLabel 'min', mousePosLeft

    if @draggingMax
      @maxHandleLeft = mousePosLeft - (@handleWidth/2)

      if @minHandleLeft < mousePosLeft <= @sliderWidth
        @$maxHandle.css 'left', @maxHandleLeft
        @$bar.css 'right', @sliderWidth - mousePosLeft
        @updateHandleLabel 'max', mousePosLeft

  updateHandleLabel: (handle, leftPos) ->
    @$('button').show()

    year = getYearFromLeftPos leftPos

    if handle is 'min'
      @$minValue.html value
      @currentRange.min = value
      @$('.single-value').html = "#{value} - #{@$maxValue.html()}"
    else
      @$maxValue.html value
      @currentRange.max = value
      @$('.single-value').html = "#{@$minValue.html()} - #{value}"

  # Given a left position in px, return the corresponding year.
  getYearFromLeftPos: () ->
    ll = @model.get('options').lowerLimit
    ul = @model.get('options').upperLimit
    diff = ul - ll
    sw = @sliderWidth

    (leftPos) -> Math.floor ll + leftPos/sw * diff

  # Given a year, return the left position in px.
  getLeftPosFromYear: (year) ->
    ll = @model.get('options').lowerLimit
    ul = @model.get('options').upperLimit
    left = ((year - ll) / (ul - ll)) * @sliderWidth
    Math.floor left

module.exports = RangeFacet