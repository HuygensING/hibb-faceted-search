Backbone = require 'backbone'
_ = require 'underscore'
$ = require 'jquery'

tpl = require '../../jade/facets.jade'

class Facets extends Backbone.View

  className: 'facets'

  viewMap:
    BOOLEAN: require './facets/boolean'
    DATE: require './facets/date'
    RANGE: require './facets/range'
    LIST: require './facets/list'

  # ### Initialize
  initialize: (options) ->
    _.extend @viewMap, options.viewMap

    @config = options.config

    # A map of the facet views. Used for looping through all facet views
    # and call methods like update, reset and render.
    @views = {}

    @render()

  # ### Render
  render: ->
    tpl = @config.get('templates').facets if @config.get('templates').hasOwnProperty 'facets'
    @el.innerHTML = tpl()

    @

  renderFacets: (data) ->
    @destroyFacets()

    # If there is a template for main, than use the template and
    # attach facets to their placeholder.
    if @config.get('templates').hasOwnProperty 'facets'
      for facetData, index in data
        if @viewMap.hasOwnProperty facetData.type
          placeholder = @el.querySelector(".#{facetData.name}-placeholder")

          if placeholder?
            placeholder.parentNode.replaceChild @renderFacet(facetData).el, placeholder
    # If there is no template for main, create a document fragment and append
    # all facets to it and attach it to the DOM.
    else
      fragment = document.createDocumentFragment()

      for own index, facetData of data
        if @viewMap.hasOwnProperty facetData.type
          fragment.appendChild @renderFacet(facetData).el
          fragment.appendChild document.createElement 'hr'
        else
          console.error 'Unknown facetView', facetData.type

      @el.innerHTML = ''
      @el.appendChild fragment

    @

  renderFacet: (facetData) =>
    if _.isString(facetData)
      facetData = _.findWhere @searchResults.first().get('facets'), name: facetData

    View = @viewMap[facetData.type]
    @views[facetData.name] = new View
      attrs: facetData,
      config: @config

    @listenTo @views[facetData.name], 'change', (queryOptions, options={}) =>
      @trigger 'change', queryOptions, options

    @views[facetData.name]

  # ### Methods
  update: (facetData) ->
#    console.log facetData
    for own viewName, view of @views
      data = _.findWhere(facetData, name: viewName)
      options = if data? then data.options else []

      view.update options
#      @views[facetData.name].update(facetData.options) if @views.hasOwnProperty facetData.name

  reset: ->
    for own key, facetView of @views
      facetView.reset() if typeof facetView.reset is 'function'

  destroyFacets: ->
    @stopListening()

    for own viewName, view of @views
      view.destroy()
      delete @views[viewName]

  destroy: ->
    @destroyFacets()
    @remove()

  # The facets are slided one by one. When the slide of a facet is finished, the
  # next facet starts sliding. That's why we use a recursive function.
  toggle: (ev) ->
    ev.preventDefault()

    icon = $(ev.currentTarget).find('i.fa')
    span = $(ev.currentTarget).find('span')

    open = icon.hasClass 'fa-expand'
    icon.toggleClass 'fa-compress'
    icon.toggleClass 'fa-expand'

    text = if open then 'Collapse' else 'Expand'
    span.text "#{text} facets"

    facetNames = _.keys @views
    index = 0

    slideFacet = =>
      facetName = facetNames[index++]
      facet = @views[facetName]

      if facet?
        if open
          facet.showBody -> slideFacet()
        else
          facet.hideBody -> slideFacet()

    slideFacet()

module.exports = Facets