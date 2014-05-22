setup = require '../setup'

ListOptions = require basePath + 'collections/list.options'

models = [
	visible: true
	name: 'Jaap'
	count: 1
	checked: true
,
	visible: false
	name: 'Tine'
	count: 64
	checked: false
,
	visible: false
	name: 'Bert'
	count: 61
	checked: true
,
	visible: true
	name: 'Marieke'
	count: 38
	checked: false
,
	visible: true
	name: 'Gijs'
	count: 34
	checked: true
,
	visible: false
	name: 'Ed'
	count: 72
	checked: false
]

describe 'Collection ListOptions', ->
	listOptions = null

	beforeEach ->
		listOptions = new ListOptions models
		
	describe 'initialize', ->
		it 'should be ordered by count descending, visibles first', ->
			listOptions.first().get('name').should.equal 'Marieke'
			listOptions.models[1].get('name').should.equal 'Gijs'
			listOptions.models[2].get('name').should.equal 'Jaap'
			listOptions.models[3].get('name').should.equal 'Ed'
			listOptions.models[4].get('name').should.equal 'Tine'
			listOptions.last().get('name').should.equal 'Bert'

	describe 'orderBy', ->
		it 'should order alphabetically ascending, visibles first', ->
			listOptions.orderBy 'alpha_asc'
			listOptions.first().get('name').should.equal 'Gijs'
			listOptions.models[1].get('name').should.equal 'Jaap'
			listOptions.models[2].get('name').should.equal 'Marieke'
			listOptions.models[3].get('name').should.equal 'Bert'
			listOptions.models[4].get('name').should.equal 'Ed'
			listOptions.last().get('name').should.equal 'Tine'

		it 'should order alphabetically descending, visibles first', ->
			listOptions.orderBy 'alpha_desc'
			listOptions.first().get('name').should.equal 'Marieke'
			listOptions.models[1].get('name').should.equal 'Jaap'
			listOptions.models[2].get('name').should.equal 'Gijs'
			listOptions.models[3].get('name').should.equal 'Tine'
			listOptions.models[4].get('name').should.equal 'Ed'
			listOptions.last().get('name').should.equal 'Bert'

		it 'should order count ascending, visibles first', ->
			listOptions.orderBy 'amount_asc'
			listOptions.first().get('name').should.equal 'Jaap'
			listOptions.models[1].get('name').should.equal 'Gijs'
			listOptions.models[2].get('name').should.equal 'Marieke'
			listOptions.models[3].get('name').should.equal 'Bert'
			listOptions.models[4].get('name').should.equal 'Tine'
			listOptions.last().get('name').should.equal 'Ed'

	describe 'revert', ->
		it 'should set all options checked attribute to false', ->
			listOptions.where(checked: false).length.should.equal 3
			listOptions.revert()
			listOptions.where(checked: false).length.should.equal 6

		it 'should trigger a change event', ->
			listOptions.trigger = setup.sinon.spy()
			listOptions.revert()
			listOptions.trigger.should.have.been.calledWith 'change'

	describe 'updateOptions', ->
		it 'should set all counts to 0 and update counts of existing models', ->
			listOptions.where(count: 72).length.should.equal 1

			newOptions = [
				name: 'Gijs'
				count: 72
			,
				name: 'Marieke'
				count: 72
			]

			listOptions.updateOptions newOptions

			# Gijs and Marieke should be updated to count 72
			listOptions.where(count: 72).length.should.equal 2

			# Ed should be reverted to count 0
			listOptions.findWhere(name: 'Ed').get('count').should.equal 0

		it 'should add a model when it does not exists', ->
			newOptions = [
				name: 'Marianne'
				count: 71
			]

			listOptions.updateOptions newOptions
			listOptions.length.should.equal 7


		it 'should set all counts to 0', ->
			listOptions.where(count: 72).length.should.equal 1
			listOptions.updateOptions()
			listOptions.where(count: 0).length.should.equal 6

	describe 'setAllVisible', ->
		it 'should set all options attribute visible to true', ->
			listOptions.where(visible: true).length.should.equal 3
			listOptions.setAllVisible()
			listOptions.where(visible: true).length.should.equal 6