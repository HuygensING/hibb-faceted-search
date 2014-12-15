Backbone = require 'backbone'
_ = require 'underscore'

SearchResult = require '../models/searchresult'

funcky = require 'funcky.req'

###
@class
###
class SearchResults extends Backbone.Collection

	model: SearchResult

	###
	@constructs
	@param {object[]} models
	@param {object} options
	@param {Backbone.Model} options.config
	###
	initialize: (models, options) ->
		@config = options.config

		# Init cachedModels in the initialize function, because when defined in the class
		# as a property, it is defined on the prototype and thus not refreshed when we instantiate
		# a new Collection.
		@cachedModels = {}

		# Hold a count of the number of run queries. We can't use @length, because
		# if the second query is fetched from cache, the length stays at length one.
		# @queryAmount = 0

		# @on 'add', @_setCurrent, @

	clearCache: ->
		@cachedModels = {}

	getCurrent: ->
		@_current

	_setCurrent: (@_current, changeMessage) ->
		@trigger changeMessage, @_current

	###
	Add the latest search result model to a collection for caching.

	@method
	@param {string} url - Base location of the resultModel. Is used to fetch parts of the result which are not prev or next but at a different place (for example: row 100 - 110) in the result set.
	@param {object} attrs - The properties/attributes of the resultModel.
	@param {string} cacheId - The ID to file the props/attrs under for caching.
	@param {string} changeMessage - The event message to trigger.
	###
	_addModel: (url, attrs, cacheId, changeMessage) ->
		attrs.location = url
		@cachedModels[cacheId] = new @model attrs
		@add @cachedModels[cacheId]
		@_setCurrent @cachedModels[cacheId], changeMessage
		# @trigger changeMessage, @cachedModels[cacheId]


	###
	@method
	@param {object} queryOptions
	@param {object} [options={}]
	@param {boolean} options.cache - Determines if the result can be fetched from the cachedModels (searchResult models). In case of a reset or a refresh, options.cache is set to false.
	###
	runQuery: (queryOptions, options={}) ->
		options.cache ?= true

		changeMessage = 'change:results'
		# @queryAmount = @queryAmount + 1

		# Artifact?
		# if queryOptions.hasOwnProperty 'resultRows'
		#   resultRows = queryOptions.resultRows
		#   delete queryOptions.resultRows

		queryOptionsString = JSON.stringify queryOptions

		# The search results are cached by the query options string,
		# so we check if there is such a string to find the cached result.
		if options.cache and @cachedModels.hasOwnProperty queryOptionsString
			@_setCurrent @cachedModels[queryOptionsString], changeMessage
		else
			@postQuery queryOptions, (url) =>
				getUrl = "#{url}?rows=#{@config.get('resultRows')}"

				@getResults getUrl, (response) =>
					@_addModel url, response, queryOptionsString, changeMessage

	moveCursor: (direction) ->
		url = if direction is '_prev' or direction is '_next' then @_current.get direction else direction
		changeMessage = 'change:cursor'

		if url?
			if @cachedModels.hasOwnProperty url
				@_setCurrent @cachedModels[url], changeMessage
			else
				@getResults url, (response) =>
					@_addModel @_current.get('location'), response, url, changeMessage

	# TODO breaking for Rembench, database isn't send back. Add to result model.
	page: (pagenumber, database) ->
		changeMessage = 'change:page'

		start = @config.get('resultRows') * (pagenumber - 1)
		url = @_current.get('location') + "?rows=#{@config.get('resultRows')}&start=#{start}"
		url += "&database=#{database}" if database?

		if @cachedModels.hasOwnProperty url
			@_setCurrent @cachedModels[url], changeMessage
		else
			@getResults url, (response) =>
				@_addModel @_current.get('location'), response, url, changeMessage

	postQuery: (queryOptions, done) ->
		@trigger 'request'

		ajaxOptions =
			data: JSON.stringify queryOptions

		if @config.has 'authorizationHeaderToken'
			ajaxOptions.headers = Authorization: @config.get('authorizationHeaderToken')

		# This is used for extra options to the ajax call,
		# such as setting custom headers (e.g., VRE_ID)
		if @config.has 'requestOptions'
			_.extend ajaxOptions, @config.get('requestOptions')

		req = funcky.post @config.get('baseUrl') + @config.get('searchPath'), ajaxOptions
		req.done (res) =>
			if res.status is 201
				# @postURL = res.getResponseHeader('Location')
				# url = if @config.has('resultRows') then @postURL + '?rows=' + @config.get('resultRows') else @postURL
				# Add number of results to fetch.
				done res.getResponseHeader('Location')
		req.fail (res) =>
			if res.status is 401
				@trigger 'unauthorized'
			else
				@trigger 'request:failed', res
				throw new Error 'Failed posting FacetedSearch queryOptions to the server!', res

	getResults: (url, done) ->
		@trigger 'request'

		if @config.has 'authorizationHeaderToken'
			options =
				headers:
					Authorization: @config.get('authorizationHeaderToken')

		# Fire GET request.
		req = funcky.get url, options

		req.done (res) =>
			done JSON.parse res.responseText

			@trigger 'sync'

		req.fail (res) =>
			if res.status is 401
				@trigger 'unauthorized'
			else
				@trigger 'request:failed', res
				throw new Error 'Failed getting FacetedSearch results from the server!', res

module.exports = SearchResults