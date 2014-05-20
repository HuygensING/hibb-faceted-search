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
		changeMessage = if @current.options.url? then 'change:cursor' else 'change:results'
		@trigger changeMessage, @current

	# options.cache Boolean
	# 	Determines if the result can be fetched from the cachedModels (searchResult models).
	# 	In case of a reset or a refresh, options.cache is set to false.
	# options.reset	Boolean 
	#	If the query is used for resetting the Faceted Search, the reset boolean is set to the searchResult model. 
	# 	This attribute is used in the main view to determine how to render the facets.
	runQuery: (queryOptions, options={}) ->
		@queryAmount += 1

		options.cache ?= true
		options.reset ?= false

		if queryOptions.hasOwnProperty 'resultRows'
			resultRows = queryOptions.resultRows
			delete queryOptions.resultRows

		cacheString = JSON.stringify queryOptions

		# The search results are cached by the query options string,
		# so we check if there is such a string to find the cached result.
		if options.cache and @cachedModels.hasOwnProperty cacheString
			@setCurrent @cachedModels[cacheString]
		else
			@trigger 'request'

			opts = {}
			opts.cacheString = cacheString
			opts.queryOptions = queryOptions
			opts.resultRows = resultRows if resultRows?

			searchResult = new SearchResult null, opts
			searchResult.fetch
				success: (model) =>
					model.set 'reset', options.reset
					@cachedModels[cacheString] = model
					@add model
				error: (model, jqXHR, options) => @trigger 'unauthorized' if jqXHR.status is 401

	moveCursor: (direction) ->
		url = if direction is '_prev' or direction is '_next' then @current.get direction else direction

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