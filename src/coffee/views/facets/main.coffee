Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'

tpl = require '../../../jade/facets/main.jade'

class Facet extends Backbone.View

  # ### Initialize
  initialize: (options) ->
    @config = options.config

    # Override the facet title if the user has given an alternative title in the config.
    options.attrs.title = @config.get('facetTitleMap')[options.attrs.name] if @config.get('facetTitleMap').hasOwnProperty options.attrs.name

  # ### Render
  render: ->
    tpl = @config.get('templates')['facets.main'] if @config.get('templates').hasOwnProperty 'facets.main'
    @$el.html tpl
      model: @model
      config: @config

    @$el.attr 'data-name', @model.get('name')

    @

  # ### Events
  events: ->
    'click h3': 'toggleBody'

  toggleBody: (ev) ->
    func = if @$('.body').is(':visible') then @hideBody else @showBody

    # If ev is a function, than it is the callback. Use call to pass the context.
    if _.isFunction ev then func.call @, ev else func.call @

  # ### Methods
  hideMenu: ->
    $button = @$ 'header i.openclose'
    $button.addClass 'fa-plus-square-o'
    $button.removeClass 'fa-minus-square-o'

    @$('header .options').slideUp(150)

  hideBody: (done) ->
    @hideMenu()

    @$('.body').slideUp 100, =>
      done() if done?
      @$('header i.fa').fadeOut 100

  showBody: (done) ->
    @$('.body').slideDown 100, =>
      done() if done?
      @$('header i.fa').fadeIn 100

  destroy: -> @remove()

  # NOOP: Override in child
  update: (newOptions) -> # console.log newOptions
  reset: ->
  postRender: ->


module.exports = Facet