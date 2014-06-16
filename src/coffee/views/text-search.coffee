Backbone = require 'backbone'
_ = require 'underscore'

config = require '../config'

Models =
  Search: require '../models/search'

tpl = require '../../jade/text-search.jade'

class TextSearch extends Backbone.View

  className: 'text-search'

  # ### Initialize
  initialize: (options) ->
    @reset()

  setModel: ->
    @stopListening @model if @model?

    @model = new Models.Search config.textSearchOptions

  # ### Render
  render: ->
    tpl = config.templates['text-search'] if config.templates.hasOwnProperty 'text-search'
    @$el.html tpl model: @model

    @

  # ### Events
  events: ->
    # 'click button': (ev) -> ev.preventDefault()
    # 'click button.active': 'search'
    # 'click header i.openclose': 'toggleMenu'
    'click i.fa-search': 'search'
    'keyup input[name="search"]': 'onKeyUp'
    'focus input[name="search"]': -> @$('.body .menu').slideDown(150)
    'click .menu .fa-times': -> @$('.body .menu').slideUp(150)
    'change input[type="checkbox"]': 'checkboxChanged'

  onKeyUp: (ev) ->
    # Update the mainModel (queryOptions) silently. We want to set the term
    # to the mainModel. When autoSearch is off and the user wants to
    # perform a search, the term is known to the queryModel.
    if @model.get('term') isnt ev.currentTarget.value
      @model.set term: ev.currentTarget.value
      @updateQueryModel()

    if ev.keyCode is 13
      ev.preventDefault()
      @search ev

  checkboxChanged: (ev) ->
    if attr = ev.currentTarget.getAttribute('data-attr')
      if attr is 'searchInTranscriptions'
        @$('ul.textlayers').toggle ev.currentTarget.checked
      @model.set attr, ev.currentTarget.checked
    else if attr = ev.currentTarget.getAttribute('data-attr-array')
      checkedArray = []
      for cb in @el.querySelectorAll '[data-attr-array="'+attr+'"]' when cb.checked
        checkedArray.push cb.getAttribute('data-value')
      @model.set attr, checkedArray

    @updateQueryModel()

  search: (ev) ->
    ev.preventDefault()
    @trigger 'search'

  # ### Methods
  updateQueryModel: -> @trigger 'change', @model.queryData()

  reset: ->
    @setModel()
    @render()

  destroy: -> @remove()

module.exports = TextSearch