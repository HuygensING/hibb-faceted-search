# queryOptions:
# 	resultRows: Number => number of results to return by the server

define (require) ->
	pubsub = require 'hilib/mixins/pubsub'
	SearchResult = require 'models/searchresult'

	class SearchResults extends Backbone.Collection

		model: SearchResult

		initialize: ->
			_.extend @, pubsub

			@currentQueryOptions = null
			@cachedModels = {}

			@on 'add', @setCurrent, @

		setCurrent: (model) ->
			@current = model
			@publish 'change:results', model, @currentQueryOptions

		runQuery: (@currentQueryOptions) ->
			if @currentQueryOptions.hasOwnProperty 'resultRows'
				resultRows = @currentQueryOptions.resultRows
				delete @currentQueryOptions.resultRows

			options = {}
			options.resultRows = resultRows if resultRows?
			options.queryOptions = JSON.stringify @currentQueryOptions

			# The search results are cached by the query options string,
			# so we check if there is such a string to find the cached result.
			if @cachedModels.hasOwnProperty options.queryOptions
				@setCurrent @cachedModels[options.queryOptions]
			else
				@trigger 'request'

				searchResult = new SearchResult null, options
				searchResult.fetch
					success: (model) => 
						@cachedModels[options.queryOptions] = model
						@add model

		moveCursor: (direction) ->
			if url = @current.get direction
				if @cachedModels.hasOwnProperty url
					@setCurrent @cachedModels[url]
				else
					@trigger 'request'
					
					searchResult = new SearchResult()
					searchResult.fetch
						url: url
						success: (model, response, options) => 
							@cachedModels[url] = model
							@add model