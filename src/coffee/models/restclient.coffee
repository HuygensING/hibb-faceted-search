# define (require) ->
# 	ajax = require 'managers/ajax'

# 	Models =
# 		Base: require 'models/base'

# 	class RestClient extends Models.Base

# 		defaults: ->
# 			term: '*'
# 			facetValues: []

# 		sync: (method, model, options) ->
# 			if method is 'read'
# 				ajax.token = @get 'token'

# 				jqXHR = ajax.post
# 					url: @get('baseUrl') + @get('searchUrl')
# 					data: JSON.stringify @get 'queryOptions'
# 					dataType: 'text'

# 				jqXHR.done (data, textStatus, jqXHR) =>
# 					if jqXHR.status is 201
# 						xhr = ajax.get url: jqXHR.getResponseHeader('Location')
# 						xhr.done options.success

# 				jqXHR.fail (jqXHR, textStatus, errorThrown) =>
# 					if jqXHR.status is 401
# 						@publish 'unauthorized'