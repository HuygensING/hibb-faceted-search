define (require) ->

	ajax = require 'hilib/managers/ajax'
	token = require 'hilib/managers/token'

	config = require 'config'

	Models =
		Base: require 'hilib/models/base'

	class SearchResult extends Models.Base

		defaults: ->
			_next: null
			_prev: null
			ids: []
			numFound: null
			results: []
			rows: null
			solrquery: ''
			sortableFields: []
			start: null
			term: ''

		# ### INITIALIZE
		# Make options available to the whole object
		initialize: (attrs, @options) ->
			super

			# Property to keep track of the url which is used to POST for a new search.
			# This URL is used for navigating within the result set.
			@postURL = null

		sync: (method, model, options) ->
			if method is 'read'

				# IF an url is passed as an option, use it. This is the case when moving the cursor (next/prev search result).
				if @options.url?
					@getResults @options.url, options.success
				else
					jqXHR = ajax.post
						url: config.baseUrl + config.searchPath
						data: JSON.stringify @options.queryOptions
						dataType: 'text'

					jqXHR.done (data, textStatus, jqXHR) =>
						if jqXHR.status is 201
							@postURL = jqXHR.getResponseHeader('Location')
							url = if @options.resultRows? then @postURL + '?rows=' + @options.resultRows else @postURL

							@getResults url, options.success

					jqXHR.fail (jqXHR, textStatus, errorThrown) =>
						@publish 'unauthorized' if jqXHR.status is 401

		getResults: (url, done) ->
			ajax.token = config.token
			jqXHR = ajax.get url: url
			jqXHR.done (data, textStatus, jqXHR) =>	done data
			jqXHR.fail => console.error 'Failed getting FacetedSearch results from the server!', arguments

		page: (pagenumber, database) ->
			start = @options.resultRows * (pagenumber - 1)
			url = @postURL + "?rows=#{@options.resultRows}&start=#{start}"
			url += "&database=#{database}" if database?

			@getResults url, (data) =>
				@set data
				@publish 'change:page', @, database
