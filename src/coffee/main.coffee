Backbone = require 'backbone'
$ = require 'jquery'
Backbone.$ = $

_ = require 'underscore'

funcky = require 'funcky.el'

Config = require './config'

QueryOptions = require './models/query-options'
SearchResults = require './collections/searchresults'

Views =
  TextSearch: require './views/text-search'
  Facets: require './views/facets'

tpl = require '../jade/main.jade'

class MainView extends Backbone.View

  # ### Initialize
  initialize: (options={}) ->
    # The facetViewMap cannot be part of the config, because of circular reference.
    # The facetViewMap is removed from the options, so it is not added to config.
    # Do this before @extendConfig.
    if options.facetViewMap?
      @facetViewMap = _.clone options.facetViewMap
      delete options.facetViewMap

    @extendConfig options

    @initQueryOptions()

    @initSearchResults()

    @render()

    if @config.get 'development'
      @searchResults.add JSON.parse localStorage.getItem('faceted-search-dev-model')
      @searchResults.cachedModels['{"facetValues":[],"sortParameters":[]}'] = @searchResults.first()
      setTimeout (=> @$('.overlay').hide()), 100

  # ### Render
  render: ->
    tpl = @config.get('templates').main if @config.get('templates').hasOwnProperty 'main'

    @el.innerHTML = tpl()

    @$('.faceted-search').addClass "search-type-#{@config.get('textSearch')}"

    # Instantiate the Facets view after instantiating the QueryOptions model and
    # before rendering the textSearch. The textSearchPlaceholder can be located
    # in the main and in the facets template. So we render the facets view to
    # get (potentially) the div.text-search-placeholder and call renderFacets
    # in @update, to actually render the separate facet views.
    @initFacets @facetViewMap

    # See config for more about none, simple and advanced options.
    if @config.get('textSearch') is 'simple' or @config.get('textSearch') is 'advanced'
      @renderTextSearch()

    @

  renderTextSearch: ->
    @textSearch = new Views.TextSearch config: @config
    textSearchPlaceholder = @el.querySelector('.text-search-placeholder')
    textSearchPlaceholder.parentNode.replaceChild @textSearch.el, textSearchPlaceholder

    @listenTo @textSearch, 'change', (queryOptions) =>
      @queryOptions.set queryOptions, silent: true

    @listenTo @textSearch, 'search', =>
      @search()

  # ### Events
  events: ->
    'click ul.facets-menu li.collapse-expand': (ev) -> @facets.toggle ev
    # Don't use @refresh as String, because the ev object will be passed.
    'click ul.facets-menu li.reset': 'onReset'
    'click ul.facets-menu li.switch button': 'onSwitchType'

  onSwitchType: (ev) ->
    ev.preventDefault()

    textSearch = if @config.get('textSearch') is 'advanced' then 'simple' else 'advanced'
    @config.set textSearch: textSearch

    @$('.faceted-search').toggleClass 'search-type-simple'
    @$('.faceted-search').toggleClass 'search-type-advanced'

    if @searchResults.queryAmount is 1
      @search()
    else if @searchResults.queryAmount > 1
      @update()

  onReset: (ev) ->
    ev.preventDefault()
    @reset()

  # ### Methods

  destroy: ->
    @facets.destroy() if @facets?
    @textSearch.destroy() if @textSearch?

    @remove()

  extendConfig: (options) ->

    ftm = options.facetTitleMap
    delete options.facetTitleMap

    @config = new Config options

    @config.set facetTitleMap: _.extend @config.get('facetTitleMap'), ftm

    # Set the default of config type in case the user sends an unknown string.
    @config.set textSearch: 'advanced' if ['none', 'simple', 'advanced'].indexOf(@config.get('textSearch')) is -1

  initQueryOptions: ->
    attrs = _.extend @config.get('queryOptions'), @config.get('textSearchOptions')
    @queryOptions = new QueryOptions attrs

    if @config.get 'autoSearch'
      @listenTo @queryOptions, 'change', => @search()

  initSearchResults: ->
    @searchResults = new SearchResults config: @config

    # Listen to the change:results event and (re)render the facets everytime the result changes.
    @listenTo @searchResults, 'change:results', (responseModel) =>
      # Nothing needs updating if the facets aren't visible.
      @update() if @config.get('textSearch') isnt 'simple'
      @trigger 'change:results', responseModel

    # The cursor is changed when @next or @prev are called. They are rarely used, since pagination uses @page and thus change:page.
    @listenTo @searchResults, 'change:cursor', (responseModel) => @trigger 'change:results', responseModel

    @listenTo @searchResults, 'change:page', (responseModel, database) => @trigger 'change:page', responseModel, database

    # Backbone triggers a request event when sending a request to the server.
    # In searchResults the request event is triggered manually, because searchResults.sync
    # isnt used.
    @listenTo @searchResults, 'request', => @showLoader()
    # Same goes for sync, but this event is triggered when the response is received.
    @listenTo @searchResults, 'sync', => @hideLoader()

    @listenTo @searchResults, 'unauthorized', => @trigger 'unauthorized'
    @listenTo @searchResults, 'request:failed', (res) => @trigger 'request:failed', res

  initFacets: (viewMap={}) ->
    @facets = new Views.Facets
      viewMap: viewMap
      config: @config

    # Replace the facets placeholder with the 'real' DOM element (@facets.el).
    facetsPlaceholder = @el.querySelector('.facets-placeholder')
    facetsPlaceholder.parentNode.replaceChild @facets.el, facetsPlaceholder

  showLoader: ->
    overlay = @el.querySelector('.overlay')
    return false if overlay.style.display is 'block'

    loader = overlay.children[0]
    facetedSearch = @el.querySelector('.faceted-search')

    fsBox = funcky(facetedSearch).boundingBox()
    overlay.style.width = fsBox.width + 'px'
    overlay.style.height = fsBox.height + 'px'
    overlay.style.display = 'block'

    left =  fsBox.left + fsBox.width/2 - 12
    loader.style.left = left + 'px'

    top = fsBox.top + fsBox.height/2 - 12
    top = '50vh' if fsBox.height > window.innerHeight
    loader.style.top = top + 'px'

  hideLoader: ->
    @el.querySelector('.overlay').style.display = 'none'

  update: ->
    facets = @searchResults.current.get('facets')

    # If the size of the searchResults is 1 then it's the first time we render the facets
    if @searchResults.queryAmount is 1
      @facets.renderFacets facets
    # If the size is greater than 1, the facets are already rendered and we call their update methods.
    else if @searchResults.queryAmount > 1
      @facets.update facets

  # ### Interface

  page: (pagenumber, database) ->
    @searchResults.page pagenumber, database

  next: ->
    @searchResults.moveCursor '_next'

  prev: ->
    @searchResults.moveCursor '_prev'

  hasNext: ->
    @searchResults.current.has '_next'

  hasPrev: ->
    @searchResults.current.has '_prev'

  sortResultsBy: (field) ->
    @queryOptions.set sort: field

  # Silently change @attributes and trigger a change event manually afterwards.
  # arguments.cache Boolean Tells searchResults if we want to fetch result from cache.
  # In an app where data is dynamic, we usually don't want cache (get new result from server),
  # in an app where data is static, we can use cache to speed up the app.
  reset: (cache=false) ->
    @textSearch.reset() if @textSearch?

    @facets.reset()

    @queryOptions.reset()

    @searchResults.clearCache() unless cache

    @search cache: cache

  # A refresh of the Faceted Search means (re)sending the current @attributes (queryOptions) again.
  # We set the cache flag to false, otherwise the searchResults collection will return the cached
  # model, instead of fetching a new one from the server.
  # The newQueryOptions are optional. The can be used to add or update one or more queryOptions
  # before sending the same (or now altered) queryOptions to the server again.
#  refresh: (newQueryOptions={}) ->
#    if Object.keys(newQueryOptions).length > 0
#      @set newQueryOptions, silent: true
#    @search cache: false

  search: ->
    @searchResults.runQuery @queryOptions.attributes

module.exports = MainView