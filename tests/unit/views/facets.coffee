setup = require './setup'

describe 'View: Facets ::', ->
  describe 'updateFacets :::', ->
    it 'should return false if textSearch is simple', ->
      config.textSearch = 'simple'
      mainView.updateFacets().should.not.be.ok

    it 'should hide the loader', ->
      mainView.searchResults.queryAmount = 1
      mainView.searchResults.current = new Backbone.Model(reset: false)
      mainView.renderFacets = setup.sinon.spy()
      mainView.destroyFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.$('.loader').css('display').should.equal 'none'

    it 'should call destroyFacets and renderFacets after first searchResult', ->
      mainView.searchResults.queryAmount = 1
      mainView.searchResults.current = new Backbone.Model(reset: false)
      mainView.destroyFacets = setup.sinon.spy()
      mainView.renderFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.destroyFacets.should.have.been.called
      mainView.renderFacets.should.have.been.called

    it 'should call destroyFacets and renderFacets after first searchResult', ->
      mainView.searchResults.queryAmount = 12
      mainView.searchResults.current = new Backbone.Model(reset: true)
      mainView.destroyFacets = setup.sinon.spy()
      mainView.renderFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.destroyFacets.should.have.been.called
      mainView.renderFacets.should.have.been.called

    it 'should call update after second searchResult', ->
      mainView.searchResults.queryAmount = 2
      mainView.searchResults.current = new Backbone.Model(reset: false)
      mainView.update = setup.sinon.spy()
      mainView.updateFacets()
      mainView.update.should.have.been.called

  describe 'renderFacet', ->
    args =
      name: 'testFacet'
      type: 'LIST'
      title: 'Test facet'
    it 'should return a facetView', ->
      mainView.renderFacet(args).should.be.instanceof FacetView

    it 'should call listenTo', ->
      mainView.listenTo = setup.sinon.spy()
      mainView.renderFacet(args)
      mainView.listenTo.should.have.been.called