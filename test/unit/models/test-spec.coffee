define ['squire', 'chai', 'config'], (Squire, chai, config) ->
	describe 'config', ->
		describe '.search', ->
			it 'should be true', ->
				config.search.should.equal true


	describe 'config mocked', ->
		describe '.search', ->
			# injector = new Squire
			# injector.mock('config', {search: false})
			# after -> injector.clean()

			# it 'should be false', ->
			# 	config.search.should.equal false

			# injector.run = (deps, callback) ->
			# 	self = @
			# 	run = (done) ->
			# 		self.require deps, ->
			# 			console.log "Hello!", arguments
			# 			callback.apply null, arguments
			# 			done()
		
			# 	run.toString = -> callback.toString()
			# 	console.log "RUN: ", run.toString()

			# 	run

			# it 'should be false', injector.run ['config'], (config) ->
			# 	console.log "In Callback!"
			# 	# config.search.should.equal false