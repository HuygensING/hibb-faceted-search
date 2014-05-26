setup = require './setup'

Main = require basePath + 'main'

describe 'View Main', ->
	mainView = null

	beforeEach ->
		mainView = new Main()

	describe 'reset', ->
		it 'should call the main models reset method', ->
			mainView.model.reset = setup.sinon.spy()

			mainView.reset true
			mainView.model.reset.should.have.been.calledWith true

			mainView.reset false
			mainView.model.reset.should.have.been.calledWith false

		# FIX How to test if it isn't called when no textSearch view exists?
		# When the sinon spy is created, the facetViews has a textSearch object
		# and it will be called by reset().
		it 'should call the textSearch reset method if textSearch is loaded', ->
			mainView.facetViews.textSearch = {'id': 'dummyview'}
			mainView.facetViews.textSearch.reset = setup.sinon.spy()
			
			mainView.reset()
			
			mainView.facetViews.textSearch.reset.should.have.been.called