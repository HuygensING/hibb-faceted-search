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

		initialize: ->
			super



			@on 'change:facetValues', @fetch, @
			
			@subscribe 'facet:list:changed', (data) =>
				fv = _.reject @get('facetValues'), (val) -> val.name is data.name
				fv.push data
				@set 'facetValues', fv

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