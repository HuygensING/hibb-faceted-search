Backbone = require 'backbone'
_ = require 'underscore'

Models =
  Search: require '../models/search'

tpl = require '../../jade/text-search.jade'

class TextSearch extends Backbone.View

  className: 'text-search'

  # ### Initialize
  initialize: (options) ->
    @config = options.config
    @reset()

  setModel: ->
    @stopListening @model if @model?

    @model = new Models.Search @config.get('textSearchOptions')

  # ### Render
  render: ->
    tpl = @config.get('templates')['text-search'] if @config.get('templates').hasOwnProperty 'text-search'
    @$el.html tpl model: @model

    @

  # ### Events
  events: ->
    'click i.fa-search': 'search'
    'keyup input[name="search"]': 'onKeyUp'
    'focus input[name="search"]': -> @$('.body .menu').slideDown(150)
    'click .menu .fa-times': -> @$('.body .menu').slideUp(150)
    'change input[type="checkbox"]': 'checkboxChanged'

  onKeyUp: (ev) ->
    if ev.keyCode is 13
      ev.preventDefault()
      return @search ev

    # Update the mainModel (queryOptions) silently. We want to set the term
    # to the mainModel. When autoSearch is off and the user wants to
    # perform a search, the term is known to the queryModel.
    if @model.get('term') isnt ev.currentTarget.value
      @model.set term: ev.currentTarget.value
      @updateQueryModel()


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