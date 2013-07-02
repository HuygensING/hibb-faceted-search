define (require) ->

	ajax = require 'managers/ajax'

	Models =
		Base: require 'models/base'

	class FacetedSearch extends Models.Base

		defaults: ->
			url: ''

		query: (queryData, cb) ->
			fetchResults = (key) => # GET results from the server
				jqXHR = ajax.get
					url: @get('url') + '/' + key

				jqXHR.done cb

			jqXHR = ajax.post
				url: @get 'url'
				contentType: 'application/json; charset=utf-8'
				processData: false
				data: JSON.stringify queryData

			jqXHR.done (data) ->
				fetchResults data.key

			jqXHR.fail (jqXHR, textStatus, errorThrown) =>
				if jqXHR.status is 401
					@publish 'unauthorized'

	new FacetedSearch()