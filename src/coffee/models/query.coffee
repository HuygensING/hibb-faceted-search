define (require) ->

	Ajax = require 'managers/ajax'
	Fn = require 'helpers/fns'

	Models =
		Base: require 'models/base'
		options: require 'models/options'

	class Query extends Models.Base

		baseUrl: ''
		searchUrl: ''
		token: ''
		facetValues: {}
		
		defaults: ->
			Models.options.get 'defaultQuery'
			# term: '*'
			# facetValues: []
			# sort: 'score'
			# sortDir: 'asc'
			# fuzzy: false
			# caseSensitive: false
			# textLayers: ["Diplomatic"]
			# searchInAnnotations: false

# {
#   "term": "bla bloe z*",
#   "facetValues": [
#     {
#       "name": "metadata_folio_number",
#       "values": [ "191", "192" ],
#     }
#   ],
#   "sort": "score",
#   "sortDir": "asc",
#   "fuzzy": false,
#   "caseSensitive": false,
#   "textLayers": [
#     "Diplomatic"
#   ],
#   "searchInAnnotations": false
# }
		# set: (attrs, options) ->
		# 	options = _.values options if attrs is 'facetValues'

		# 	super attrs, options

		initialize: ->
			super



			@on 'change:facetValues', @fetch, @

			@subscribe 'facet:list:changed', (data) =>
				if data.values.length
					@facetValues[data.name] = data
				else
					delete @facetValues[data.name]

				@set 'facetValues', _.values @facetValues

				# @fetch()

		getQueryData: ->
			if @get('facetValues').length then JSON.stringify @attributes else @defaults()

		fetch: ->
			ajax = new Ajax
				baseUrl: @baseUrl
				token: @token

			fetchResults = (key) => # GET results from the server
				jqXHR = ajax.get
					url: @searchUrl + '/' + key

				jqXHR.done (data) =>
					@publish 'faceted-search:results', data

			jqXHR = ajax.post
				url: @searchUrl
				contentType: 'application/json; charset=utf-8'
				processData: false
				data: @getQueryData()

			jqXHR.done (data) ->
				fetchResults data.key

			jqXHR.fail (jqXHR, textStatus, errorThrown) =>
				if jqXHR.status is 401
					@publish 'unauthorized'

		# ajaxget: (args) ->
		# 	@fire 'get', args

		# ajaxpost: (args) ->
		# 	@fire 'post', args

		# fire: (type, args) ->
		# 	ajaxArgs =
		# 		type: type
		# 		dataType: 'json'
		# 		beforeSend: (xhr) =>
		# 			token = @get 'token'
		# 			xhr.setRequestHeader 'Authorization', "SimpleAuth #{token}"

		# 	ajaxArgs = $.extend ajaxArgs, args

		# 	$.ajax ajaxArgs

	new Query()