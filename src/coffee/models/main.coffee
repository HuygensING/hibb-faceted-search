define (require) ->

	Ajax = require 'managers/ajax'

	Models =
		Base: require 'models/base'


	class FacetedSearch extends Models.Base

		defaults: ->
			url: ''

		query: (queryData, cb) ->
			ajax = new Ajax
				baseUrl: @get 'baseUrl'
				token: @get 'token'

			fetchResults = (key) => # GET results from the server
				jqXHR = ajax.get
					url: @get('searchUrl') + '/' + key

				jqXHR.done cb

			jqXHR = ajax.post
				url: @get 'searchUrl'
				contentType: 'application/json; charset=utf-8'
				processData: false
				data: JSON.stringify queryData

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

	new FacetedSearch()