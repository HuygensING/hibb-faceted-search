setup = require '../setup'

ListOption = require basePath + 'models/list.option'

describe 'Model ListOption', ->
	listOption = null

	beforeEach ->
		listOption = new ListOption count: 12
		
	describe 'parse', ->
		it 'should set total to equal count', ->
			listOption.parse listOption.attributes
			listOption.get('total').should.equal 12