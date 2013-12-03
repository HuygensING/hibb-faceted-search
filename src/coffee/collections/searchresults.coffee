define (require) ->
	pubsub = require 'hilib/mixins/pubsub'
	SearchResult = require 'models/searchresult'

	config = require 'config'

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

			data = JSON.stringify @currentQueryOptions

			if @cachedModels.hasOwnProperty data
				@setCurrent @cachedModels[data]
			else
				@trigger 'request'
				searchResult = new SearchResult()
				searchResult.resultRows = resultRows if resultRows?
				searchResult.fetch
					data: data
					success: (model, response, options) => 
						@cachedModels[data] = model
						@add model

		moveCursor: (direction) ->
			if url = @current.get direction
				if @cachedModels.hasOwnProperty url
					@setCurrent @cachedModels[url]
				else
					@trigger 'request'
					searchResult = new SearchResult()
					searchResult.fetch
						url: config.searchPath + '/..' + url
						success: (model, response, options) => 
							@cachedModels[url] = model
							@add model