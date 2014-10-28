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
    @fields = options.fields

    @reset()

  setModel: ->
    @stopListening @model if @model?

    @model = new Models.Search @config.get('textSearchOptions')

  # ### Render
  render: ->
    if @config.has('templates').hasOwnProperty 'text-search'
      tpl = @config.get('templates')['text-search']

    @$el.html tpl
      model: @model
      fields: @fields
      textSearchTitles: @config.get('textSearchTitleMap') or {}

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
    field = ev.currentTarget.getAttribute 'data-field'

    changed = @model.get(field) isnt ev.currentTarget.value
    if changed
        @model.set field, ev.currentTarget.value
      @updateQueryModel()

    @$('button.search').toggleClass 'changed', changed

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