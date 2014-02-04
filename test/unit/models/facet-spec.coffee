define ['coffee/config', 'coffee/models/facet', 'chai'], (config, Facet, chai) ->
	describe 'Facet', ->
		facet = null
		before ->
			facet = new Facet
		it 'idAttribute should be "name"', ->
			facet.idAttribute.should.equal 'name'

		describe 'method parse', ->
			# TODO: Need to mock the use of config in Facet model, somehow
			it 'should set title mapping name to config.facetNameMap, if present'