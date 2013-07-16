# define (require) ->
# 	Backbone = require 'backbone'

# 	class Options extends Backbone.Model

# 		defaults: ->
# 			search: true
# 			defaultQuery:
# 				term: '*'
# 				facetValues: []

# 		extendDefaults: (options) ->
# 			for own attr, value of options
# 				defaultValue = @get attr
# 				value = _.extend defaultValue, value if _.isObject(defaultValue) and not _.isArray(defaultValue)

# 				@set attr, value

# 	new Options()