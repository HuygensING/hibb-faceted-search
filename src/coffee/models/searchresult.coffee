Backbone = require 'backbone'
_ = require 'underscore'

ajax = require 'hilib/src/managers/ajax'
token = require 'hilib/src/managers/token'

config = require '../config'

class SearchResult extends Backbone.Model

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
				ajaxOptions =
					url: config.baseUrl + config.searchPath
					data: JSON.stringify @options.queryOptions
					dataType: 'text'

				# This is used for extra options to the ajax call,
				# such as setting custom headers (e.g., VRE_ID)
				if config.hasOwnProperty 'requestOptions'
					_.extend ajaxOptions, config.requestOptions 

				jqXHR = ajax.post ajaxOptions

				jqXHR.done (data, textStatus, jqXHR) =>
					if jqXHR.status is 201
						@postURL = jqXHR.getResponseHeader('Location')
						url = if @options.resultRows? then @postURL + '?rows=' + @options.resultRows else @postURL

						@getResults url, options.success

				jqXHR.fail (jqXHR, textStatus, errorThrown) => options.error jqXHR
					# console.error 'Failed getting FacetedSearch results from the server!', arguments

	getResults: (url, done) ->
		ajax.token = config.token
		jqXHR = ajax.get url: url
		jqXHR.done (data, textStatus, jqXHR) =>	done data
		jqXHR.fail (jqXHR, textStatus, errorThrown) =>
			@collection.trigger 'unauthorized' if jqXHR.status is 401
			console.error 'Failed getting FacetedSearch results from the server!', arguments

	page: (pagenumber, database) ->
		start = @options.resultRows * (pagenumber - 1)
		url = @postURL + "?rows=#{@options.resultRows}&start=#{start}"
		url += "&database=#{database}" if database?

		@getResults url, (data) =>
			# # Set the data returned by the server as the attributes of this searchresult model.
			# # Do it silent, because otherwise, the change:result event would be triggered.
			# @set data, silent: true
			sr = new SearchResult data
			@collection.trigger 'change:page', sr, database

module.exports = SearchResult