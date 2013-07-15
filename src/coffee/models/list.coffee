define (require) ->

	Models =
		Base: require 'models/base'

	class List extends Models.Base

		idAttribute: 'name'

		# updateOptions: (attrs) ->
		# 	opts = @get 'options'
		# 	opts.each (option) => option.set 'count', 0

		# 	_.each attrs.options, (option) =>
		# 		option.name = '<i>(empty)</i>' if option.name is '' # Bugprone what if somebody changes the default empty name?
		# 		opt = opts.get option.name
		# 		opt.set 'count', option.count

		# 	opts.sort()

		# set: (attrs, options) ->
		# 	if not (attrs.options instanceof Collections.ListItems)
		# 		attrs.options = new Collections.ListItems attrs.options, parse: true

		# 	super attrs, options

		# parse: (attrs) ->
		# 	attrs.options = new Collections.ListItems attrs.options, parse: true

		# 	attrs