$ = require 'jquery'
_ = require 'underscore'

config = require '../../config'

Models =
  Range: require '../../models/facets/range'

Views = 
  Facet: require './main'

bodyTpl = require '../../../jade/facets/range.body.jade'

# Placeholders for stopDrag and onResize method, needed for removing event listeners.
dragStopper = null
resizer = null

class RangeFacet extends Views.Facet
  className: 'facet range'

  # ### INITIALIZE
  initialize: (options) ->

    @draggingMin = false
    @draggingMax = false

    @model = new Models.Range options.attrs, parse: true
    @listenTo @model, 'change:options', @render

    @listenTo @model, 'change:currentMin', @checkLabelOverlap
    @listenTo @model, 'change:currentMax', @checkLabelOverlap

    @render()

  # ### RENDER
  render: ->
    super

    bodyTpl = config.templates['range.body'] if config.templates.hasOwnProperty 'range.body'

    rtpl = bodyTpl @model.attributes
    @$('.body').html rtpl

    @$('header .menu').hide()

    dragStopper = @stopDragging.bind(@)
    @$el.on 'mouseleave', dragStopper

    resizer = @onResize.bind(@)
    window.addEventListener 'resize', resizer

    setTimeout (=> @postRender()), 0

    @

  postRender: ->
    # The root element of the range facet.
    @slider = @$ '.slider'
    @sliderWidth = @slider.width()
    @sliderLeft = @slider.offset().left

    # The handles that indicate the position of min and max on the range.
    # Can be dragged
    @handleMin = @$ '.handle-min'
    @handleMax = @$ '.handle-max'

    # The assumption is made that the minHandle and maxHandle have an equal width
    @handleWidth = @handleMin.width()

    # The relative left position of the min and max handle.
    @handleMinLeft = @handleMin.position().left
    @handleMaxLeft = @handleMax.position().left

    # The labels holding the min and max value.
    @labelMin = @$ 'label.min'
    @labelMax = @$ 'label.max'

    # The space (selected range) between the min and max handle.
    @bar = @$ '.bar'

    @labelSingle = @$ 'label.single'

    @button = @el.querySelector('button')

  # ### EVENTS
  events: -> _.extend {}, super,
    'mousedown .handle': 'startDragging'
    'mouseup': 'stopDragging'
    'mousemove': 'drag'
    'click button': 'doSearch'

  doSearch: (ev) ->
    ev.preventDefault()
    @triggerChange()

  startDragging: (ev) ->
    target = $ ev.currentTarget

    if target.hasClass 'handle-min'
      @draggingMin = true
      @handleMax.css 'z-index', 10
    else if target.hasClass 'handle-max'
      @draggingMax = true
      @handleMin.css 'z-index', 10

    target.css 'z-index', 11

  # Called on every scroll event! Keep optimized!
  drag: (ev) ->
    mousePosLeft = ev.clientX - @sliderLeft

    if @draggingMin
      @handleMinLeft = mousePosLeft - (@handleWidth/2)

      if -1 < mousePosLeft <= @handleMaxLeft
        @handleMin.css 'left', @handleMinLeft
        @bar.css 'left', mousePosLeft
        @updateHandleLabel 'min', mousePosLeft

    if @draggingMax
      @handleMaxLeft = mousePosLeft - (@handleWidth/2)

      if @handleMinLeft < mousePosLeft <= @sliderWidth
        @handleMax.css 'left', @handleMaxLeft
        @bar.css 'right', @sliderWidth - mousePosLeft
        @updateHandleLabel 'max', mousePosLeft

  stopDragging: ->
    if @draggingMin or @draggingMax
      @draggingMin = false
      @draggingMax = false

      @model.set currentMin: +@labelMin.html()
      @model.set currentMax: +@labelMax.html()

      # If autoSearch is off, a change event is triggerd to update the queryModel.
      # If autoSearch is on, the range facet doesn't autoSearch, but displays a
      # search button. When the button is clicked, the queryModel is updated and
      # a new search is triggered. If we silently update the model beforehand,
      # the new search would not be triggered.
      unless config.autoSearch
        @triggerChange silent: true

  # ### METHODS

  destroy: ->
    @$el.off 'mouseleave', dragStopper
    window.removeEventListener 'resize', resizer
    @remove()

  triggerChange: (options={}) ->
    queryOptions =
      facetValue:
        name: @model.get 'name'
        lowerLimit: @model.get('currentMin')+'0101'
        upperLimit: @model.get('currentMax')+'1231'

    @trigger 'change', queryOptions, options

  onResize: ->
    # Calculate and redefine properties.
    @postRender()

    # Calculate the new handle positions.
    @update
      lowerLimit: @model.get('currentMin')
      upperLimit: @model.get('currentMax')

    # The labels could be overlapping after resize.
    @checkLabelOverlap()

  checkLabelOverlap: ->
    minRect = @labelMin[0].getBoundingClientRect()
    maxRect = @labelMax[0].getBoundingClientRect()

    # If the labels overlap...
    if !(minRect.right < maxRect.left || minRect.left > maxRect.right || minRect.bottom < maxRect.top || minRect.top > maxRect.bottom)
      # Change opacity so element keeps taking it's space
      @labelMin.css 'opacity', 0
      @labelMax.css 'opacity', 0
      @labelSingle.show()
      handlesCenter = @handleMinLeft + ((@handleMaxLeft - @handleMinLeft)/2)
      left = handlesCenter - @labelSingle.width()/2 + 6
      left = @sliderWidth - @labelSingle.width() + 18 if @sliderWidth - left < @labelSingle.width()
      @labelSingle.css 'left', left
    else
      @labelMin.css 'opacity', 1
      @labelMax.css 'opacity', 1
      @labelSingle.hide()

  # Update the labels value.
  # Called on every scroll event! Keep optimized!
  updateHandleLabel: (handle, leftPos) ->
    @button.style.display = 'block' if @button?

    year = @getYearFromLeftPos leftPos

    if handle is 'min'
      @labelMin.html year
      singleValue = "#{year} - #{@labelMax.html()}"
    else
      @labelMax.html year
      singleValue = "#{@labelMin.html()} - #{year}"

    @labelSingle.html singleValue


  # Given a left position in px, return the corresponding year.
  # Called on every scroll event! Keep optimized!
  getYearFromLeftPos: (leftPos) ->
    ll = @model.get('options').lowerLimit
    ul = @model.get('options').upperLimit

    Math.floor ll + leftPos/@sliderWidth * (ul - ll)

  # Given a year, return the left position in px.
  getLeftPosFromYear: (year) ->
    ll = @model.get('options').lowerLimit
    ul = @model.get('options').upperLimit
    left = ((year - ll) / (ul - ll)) * @sliderWidth
    Math.floor left

  update: (newOptions) ->
    if _.isArray(newOptions)
      if newOptions[0]?
        newOptions = newOptions[0]
      else
        newOptions =
          lowerLimit: @model.get('options').lowerLimit
          upperLimit: @model.get('options').upperLimit

    # Only use the year.
    yearMin = +(newOptions.lowerLimit+'').substr(0, 4)
    yearMax = +(newOptions.upperLimit+'').substr(0, 4)


    # Update the labels.
    @labelMin.html yearMin
    @labelMax.html yearMax

    # Get the position of the updated years.
    leftMin = @getLeftPosFromYear yearMin
    leftMax = @getLeftPosFromYear yearMax

    # Set the handle position.
    @handleMin.css 'left', leftMin - (@handleWidth/2)
    @handleMax.css 'left', leftMax - (@handleWidth/2)

    # Update the bar.
    # Update the bar.
    @bar.css 'left', leftMin
    @bar.css 'right', @sliderWidth - leftMax

    # Position the handles.
    @handleMinLeft = leftMin - (@handleWidth/2)
    @handleMaxLeft = leftMax - (@handleWidth/2)

    # Set the current attribute in the range model.
    @model.set
      currentMin: yearMin
      currentMax: yearMax

    @button.style.display = 'none' if @button?



module.exports = RangeFacet