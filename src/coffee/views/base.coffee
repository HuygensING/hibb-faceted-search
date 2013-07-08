define (require) ->
	Backbone = require 'backbone'

	Pubsub = require 'managers/pubsub'

	class BaseView extends Backbone.View

		initialize: ->
			_.extend @, Pubsub # extend the view with pubsub terminology (just aliases for listenTo and trigger)