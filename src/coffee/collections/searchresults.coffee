Backbone = require 'backbone'
_ = require 'underscore'

SearchResult = require '../models/searchresult'

funcky = require 'funcky.req'

###
# @class
# @namespace Collections
# @uses SearchResult
###
class SearchResults extends Backbone.Collection

	###
	# @property
	# @type {SearchResult}
	###
	model: SearchResult

	###
	# Init cachedModels in the initialize function, because when defined in the class
	# as a property, it is defined on the prototype and thus not refreshed when we instantiate
	# a new Collection.
	#
	# Should be redefined during initialization to prevent sharing between instances.
	#
	# @property
	# @type {Object}
	###
	_cachedModels: null

	###
	# @construct
	# @param {Array<SearchResult>} models
	# @param {Object} this.options
	# @param {Config} this.options.config
	###
	initialize: (models, @options) ->
		# Set cachedModels to an empty object. If it was assigned on object
		# creation it would have been passed by reference and thus shared
		# by instances of SearchResults.
		@_cachedModels = {}

	###
	# @method
	###
	clearCache: ->
		@_cachedModels = {}

	###
	# Get the current result.
	#
	# This is not equivalent to @last()! The current result can also be a
	# cached result, which does not have to be the last.
	#
	# @method
	###
	getCurrent: ->
		@_current

	###
	# Set the current result.
	#
	# @method
	# @private
	###
	_setCurrent: (@_current, changeMessage) ->
		@trigger changeMessage, @_current

	###
	# Add the latest search result model to a collection for caching.
	#
	# @method
	# @private
	# @param {string} url - Base location of the resultModel. Is used to fetch parts of the result which are not prev or next but at a different place (for example: row 100 - 110) in the result set.
	# @param {object} attrs - The properties/attributes of the resultModel.
	# @param {string} cacheId - The ID to file the props/attrs under for caching.
	# @param {string} changeMessage - The event message to trigger.
	###
	_addModel: (url, attrs, cacheId, changeMessage) ->
		attrs.location = url
		@_cachedModels[cacheId] = new @model attrs
		@add @_cachedModels[cacheId]
		@_setCurrent @_cachedModels[cacheId], changeMessage
		# @trigger changeMessage, @_cachedModels[cacheId]


	###
	# @method
	# @param {Object} queryOptions
	# @param {Object} [options={}]
	# @param {Boolean} [options.cache=true] Determines if the result can be fetched from the cachedModels (searchResult models). In case of a reset or a refresh, options.cache is set to false.
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
		if options.cache and @_cachedModels.hasOwnProperty queryOptionsString
			@_setCurrent @_cachedModels[queryOptionsString], changeMessage
		else
			@postQuery queryOptions, (url) =>
				getUrl = "#{url}?rows=#{@options.config.get('resultRows')}"

				@getResults getUrl, (response) =>
					@_addModel url, response, queryOptionsString, changeMessage

	###
	# @method
	# @param {String} direction One of "_prev", "_next".
	###
	moveCursor: (direction) ->
		url = if direction is '_prev' or direction is '_next' then @_current.get direction else direction
		changeMessage = 'change:cursor'

		if url?
			if @_cachedModels.hasOwnProperty url
				@_setCurrent @_cachedModels[url], changeMessage
			else
				@getResults url, (response) =>
					@_addModel @_current.get('location'), response, url, changeMessage

	# TODO breaking for Rembench, database isn't send back. Add to result model.
	page: (pagenumber, database) ->
		changeMessage = 'change:page'

		start = @options.config.get('resultRows') * (pagenumber - 1)
		url = @_current.get('location') + "?rows=#{@options.config.get('resultRows')}&start=#{start}"
		url += "&database=#{database}" if database?

		if @_cachedModels.hasOwnProperty url
			@_setCurrent @_cachedModels[url], changeMessage
		else
			@getResults url, (response) =>
				@_addModel @_current.get('location'), response, url, changeMessage

	postQuery: (queryOptions, done) ->
		@trigger 'request'

		ajaxOptions =
			data: JSON.stringify queryOptions
			xhrFields: {
				withCredentials: true
			}
		console.log('POST options: ', ajaxOptions)

		if @options.config.has 'authorizationHeaderToken' and @options.config.get('authorizationHeaderToken') isnt 'null null'
			ajaxOptions.headers = Authorization: @options.config.get('authorizationHeaderToken')

		# This is used for extra options to the ajax call,
		# such as setting custom headers (e.g., VRE_ID)
		if @options.config.has 'requestOptions'
			_.extend ajaxOptions, @options.config.get('requestOptions')

		req = funcky.post @options.config.get('baseUrl') + @options.config.get('searchPath'), ajaxOptions

		req.done (res) =>
			if res.status is 201
				done res.getResponseHeader('Location')
			else
				throw new Error "Server should return status: 201.", res

		req.fail (res) =>
			console.log res
			if res.status is 401
				@trigger 'unauthorized'
			else
				@trigger 'request:failed', res
				throw new Error 'Failed posting FacetedSearch queryOptions to the server!', res

	getResults: (url, done) ->
		@trigger 'request'

		options =
			xhrFields:
				withCredentials: true

		if @options.config.has 'authorizationHeaderToken' and @options.config.get('authorizationHeaderToken') isnt 'null null'
			options.headers =
				Authorization: @options.config.get('authorizationHeaderToken')

		console.log('GET options: ', options)

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
