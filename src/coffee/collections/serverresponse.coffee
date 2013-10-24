define (require) ->

	Models =
		ServerResponse: require 'models/serverresponse'

	Collections =
		Base: require 'collections/base'

	class ServerResponse extends Collections.Base

		model: Models.ServerResponse