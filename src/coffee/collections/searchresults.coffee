# queryOptions:
# 	resultRows: Number => number of results to return by the server

define (require) ->
	pubsub = require 'hilib/mixins/pubsub'
	SearchResult = require 'models/searchresult'

	ajax = require 'hilib/managers/ajax'
	token = require 'hilib/managers/token'

	config = require 'config'

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

			if url?
				if @cachedModels.hasOwnProperty url
					@setCurrent @cachedModels[url]
				else				
					searchResult = new SearchResult null, url: url
					searchResult.fetch
						success: (model, response, options) => 
							@cachedModels[url] = model
							@add model

		# page: (pagenumber, database) -> @current.page pagenumber, database
			# start = @current.options.resultRows * pagenumber

			# ajax.token = config.token
			# jqXHR = ajax.post
			# 	url: "#{config.baseUrl}#{config.searchPath}"
			# 	data: JSON.stringify @current.options.queryOptions
			# 	dataType: 'text'

			# jqXHR.done (data, textStatus, jqXHR) =>
			# 	if jqXHR.status is 201
			# 		url = jqXHR.getResponseHeader('Location')
			# 		url += "?rows=#{@current.options.resultRows}&start=#{start}&database=#{database}"
			# 		@moveCursor url

		# 	start = @current.options.resultRows * pagenumber
		# 	url = "#{config.baseUrl}#{config.searchPath}?rows=#{@current.options.resultRows}&start=#{start}"
		# 	url += "&database=#{database}" if database?
			
		# 	@moveCursor url