# queryOptions:
# 	resultRows: Number => number of results to return by the server

Backbone = require 'backbone'
_ = require 'underscore'

pubsub = require 'hilib/src/mixins/pubsub'
SearchResult = require '../models/searchresult'

ajax = require 'hilib/src/managers/ajax'
token = require 'hilib/src/managers/token'

config = require '../config'

class SearchResults extends Backbone.Collection

	model: SearchResult

	initialize: ->
		_.extend @, pubsub

		@cachedModels = {}

		@on 'add', @setCurrent, @

	setCurrent: (@current) ->
		message = if @current.options.url? then 'change:cursor' else 'change:results'
		@trigger message, @current

	runQuery: (queryOptions, cache=true) ->
		if queryOptions.hasOwnProperty 'resultRows'
			resultRows = queryOptions.resultRows
			delete queryOptions.resultRows

		cacheString = JSON.stringify queryOptions

		# The search results are cached by the query options string,
		# so we check if there is such a string to find the cached result.
		if cache and @cachedModels.hasOwnProperty cacheString
			@setCurrent @cachedModels[cacheString]
		else
			@trigger 'request'

			options = {}
			options.cacheString = cacheString
			options.queryOptions = queryOptions
			options.resultRows = resultRows if resultRows?

			searchResult = new SearchResult null, options
			searchResult.fetch
				success: (model) => 
					@cachedModels[cacheString] = model
					@add model

	moveCursor: (direction) ->
		url = if direction is '_prev' or direction is '_next' then @current.get direction else direction
		url = url.replace /.+search/, config.baseUrl + config.searchPath

		if url?
			if @cachedModels.hasOwnProperty url
				@setCurrent @cachedModels[url]
			else				
				searchResult = new SearchResult null, url: url
				searchResult.fetch
					success: (model, response, options) => 
						@cachedModels[url] = model
						@add model

module.exports = SearchResults