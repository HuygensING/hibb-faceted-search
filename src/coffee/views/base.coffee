define (require) ->
	Backbone = require 'backbone'

	Pubsub = require 'pubsub'

	class BaseView extends Backbone.View

		initialize: ->
			_.extend @, Pubsub # extend the view with pubsub terminology (just aliases for listenTo and trigger)
