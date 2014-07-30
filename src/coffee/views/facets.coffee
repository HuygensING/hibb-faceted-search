Backbone = require 'backbone'
_ = require 'underscore'

class Facets extends Backbone.View
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

  # ### Render
  render: (el, data) ->
    @destroyFacets()
    # If there is a template for main, than use the template and
    # attach facets to their placeholder.
    if @config.templates.hasOwnProperty 'main'
      for facetData, index in data
        if @viewMap.hasOwnProperty facetData.type
          el.querySelector(".#{facetData.name}-placeholder").appendChild @renderFacet(facetData).el
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

      el.querySelector('.facets').innerHTML = ''
      el.querySelector('.facets').appendChild fragment

    @

  renderFacet: (facetData) =>
    if _.isString(facetData)
      facetData = _.findWhere @searchResults.first().get('facets'), name: facetData

    if @config.facetTitleMap?[facetData.name]?
      facetData.title = @config.facetTitleMap[facetData.name]

    View = @viewMap[facetData.type]
    view = @views[facetData.name] = new View attrs: facetData

    @listenTo view, 'change', (queryOptions, options={}) => @trigger 'change', queryOptions, options

    view

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