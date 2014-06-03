Backbone = require 'backbone'
_ = require 'underscore'

pubsub = require 'hilib/src/mixins/pubsub'
SearchResult = require '../models/searchresult'

ajax = require 'hilib/src/managers/ajax'

config = require '../config'

class SearchResults extends Backbone.Collection

  model: SearchResult

  initialize: ->
    _.extend @, pubsub

    # Init cachedModels in the initialize function, because when defined in the class
    # as a property, it is defined on the prototype and thus not refreshed when we instantiate
    # a new Collection.
    @cachedModels = {}

    # Hold a count of the number of run queries. We can't use @length, because
    # if the second query is fetched from cache, the length stays at length one.
    @queryAmount = 0

    @on 'add', @setCurrent, @

  clearCache: -> @cachedModels = {}

  setCurrent: (@current) ->
    changeMessage = if @current.options?.url? then 'change:cursor' else 'change:results'
    @trigger changeMessage, @current

  # options.cache Boolean
  # 	Determines if the result can be fetched from the cachedModels (searchResult models).
  # 	In case of a reset or a refresh, options.cache is set to false.
  runQuery: (queryOptions, options={}) ->
    options.cache ?= true

    @queryAmount += 1

    if queryOptions.hasOwnProperty 'resultRows'
      resultRows = queryOptions.resultRows
      delete queryOptions.resultRows

    queryOptionsString = JSON.stringify queryOptions

    # The search results are cached by the query options string,
    # so we check if there is such a string to find the cached result.
    if options.cache and @cachedModels.hasOwnProperty queryOptionsString
      @setCurrent @cachedModels[queryOptionsString]
    else
      @postQuery queryOptions, (url) =>
        @getResults url, (response) => @addModel response, queryOptionsString

  addModel: (attrs, cacheId) ->
    @cachedModels[cacheId] = new @model attrs
    @add @cachedModels[cacheId]

  moveCursor: (direction) ->
    url = if direction is '_prev' or direction is '_next' then @current.get direction else direction

    if url?
      if @cachedModels.hasOwnProperty url
        @setCurrent @cachedModels[url]
      else
        @getResults url, (response) => @addModel response, url

  page: (pagenumber, database) ->
    start = config.resultRows * (pagenumber - 1)
    url = @postURL + "?rows=#{config.resultRows}&start=#{start}"
    url += "&database=#{database}" if database?

    @getResults url, (attrs) =>
      @trigger 'change:page', new @model(attrs), database

  postQuery: (queryOptions, done) ->
    @trigger 'request'

    ajaxOptions =
      url: config.baseUrl + config.searchPath
      data: JSON.stringify queryOptions
      dataType: 'text'

    # This is used for extra options to the ajax call,
    # such as setting custom headers (e.g., VRE_ID)
    if config.hasOwnProperty 'requestOptions'
      _.extend ajaxOptions, config.requestOptions

    jqXHR = ajax.post ajaxOptions
    jqXHR.done (data, textStatus, jqXHR) =>
      if jqXHR.status is 201
        @postURL = jqXHR.getResponseHeader('Location')
        url = if config.resultRows? then @postURL + '?rows=' + config.resultRows else @postURL

        done url

    jqXHR.fail (jqXHR, textStatus, errorThrown) =>
      @trigger 'unauthorized' if jqXHR.status is 401
      console.error 'Failed posting FacetedSearch queryOptions to the server!', arguments

  getResults: (url, done) ->
    @trigger 'request'

    jqXHR = ajax.get url: url

    jqXHR.done (data, textStatus, jqXHR) =>
        done data
        @trigger 'sync'

    jqXHR.fail (jqXHR, textStatus, errorThrown) =>
      @trigger 'unauthorized' if jqXHR.status is 401
      console.error 'Failed getting FacetedSearch results from the server!', arguments

module.exports = SearchResults