define (require) ->
	Backbone = require 'backbone'

	Pubsub = require 'managers/pubsub'

	class Base extends Backbone.Model

		initialize: ->
			_.extend @, Pubsub