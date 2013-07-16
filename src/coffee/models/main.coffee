define (require) ->

	Ajax = require 'managers/ajax'
	Fn = require 'helpers/fns'

	Models =
		Base: require 'models/base'
		# options: require 'models/options'

	class FacetedSearch extends Models.Base
		facetValues: {}

		
		defaults: ->
			search: true
			baseUrl: ''
			searchUrl: ''
			token: ''

		queryOptions: ->
			term: '*'
			sort: 'score'
			fuzzy: false
			facetValues: []
			caseSensitive: false
			# sortDir: 'textLayers'
			# asc: ["Diplomatic"]
			# searchInAnnotations: false

		getQueryOption: (attr) ->
			@get('queryOptions')[attr]

		setQueryOption: (attr, value) ->
			qo = @get 'queryOptions'
			qo[attr] = value
			@set 'queryOptions', qo
			@trigger 'change:queryOptions'
		
		# defaults: -> Models.options.get 'defaultQuery'

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

			@set 'queryOptions', _.extend @queryOptions(), @get('queryOptions')

			@on 'change:queryOptions', @fetch, @

			@subscribe 'facet:list:changed', (data) =>
				if data.values.length
					@facetValues[data.name] = data
				else
					delete @facetValues[data.name]

				# fv = @get('defaultQuery').facetValues

				@setQueryOption 'facetValues', _.values @facetValues

				# @fetch()

		fetch: ->
			ajax = new Ajax
				baseUrl: @get 'baseUrl'
				token: @get 'token'

			fetchResults = (key) => # GET results from the server
				jqXHR = ajax.get
					url: @get('searchUrl') + '/' + key

				jqXHR.done (data) =>
					@publish 'faceted-search:results', data

			jqXHR = ajax.post
				url: @get 'searchUrl'
				contentType: 'application/json; charset=utf-8'
				processData: false
				data: JSON.stringify @get 'queryOptions'

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