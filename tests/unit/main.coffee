setup = require './setup'

MainModel = require basePath + 'models/main'
TextSearch = require basePath + 'views/text-search'
FacetView = require basePath + 'views/facets/main'
Main = require basePath + 'main'
config = require basePath + 'config'

describe 'View Main', ->
  mainView = null

  beforeEach ->
    mainView = new Main()

  afterEach ->
    config.textSearch = 'advanced'

  describe 'initialize', ->
    it 'should have a model', ->
      mainView.model.should.exist

    it 'should have a model of instance MainModel', ->
      mainView.model.should.be.instanceof MainModel

    it 'should call render', ->
      mainView.render = setup.sinon.spy()
      mainView.initialize()
      mainView.render.should.have.been.called

    it 'should call addListeners', ->
      mainView.addListeners = setup.sinon.spy()
      mainView.initialize()
      mainView.addListeners.should.have.been.called

    it 'should set search type to config', ->
      mainView = new Main textSearch: 'simple'
      config.textSearch.should.equal 'simple'

      mainView = new Main textSearch: 'advanced'
      config.textSearch.should.equal 'advanced'

      mainView = new Main textSearch: 'none'
      config.textSearch.should.equal 'none'

      mainView = new Main textSearch: 'some-non-existent-text-search-type'
      config.textSearch.should.equal 'advanced'

  describe 'render', ->
    clock = setup.sinon.useFakeTimers();

    it 'should load the template', ->
      mainView.render()
      mainView.$('.overlay').length.should.equal 1
      mainView.$('.faceted-search').length.should.equal 1

    it 'should set the search type class', ->
      mainView.$('.faceted-search').hasClass 'search-type-advanced'

    it 'should render textSearch when search type is advanced', ->
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.have.been.called

    it 'should call showLoader when textSearch type is advanced', ->
      mainView.showLoader = setup.sinon.spy()
      mainView.render()
      clock.tick(100)
      mainView.showLoader.should.have.been.called

    it 'should render textSearch when search type is simple', ->
      mainView = new Main textSearch: 'simple'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.have.been.called

    it 'should not call showLoader when textSearch type is simple', ->
      mainView = new Main textSearch: 'simple'
      mainView.showLoader = setup.sinon.spy()
      mainView.render()
      clock.tick(100)
      mainView.showLoader.should.not.have.been.called

    it 'should not render textSearch when search type is none', ->
      mainView = new Main textSearch: 'none'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.not.have.been.called

    it 'should call showLoader when textSearch type is none', ->
      mainView = new Main textSearch: 'none'
      mainView.showLoader = setup.sinon.spy()
      mainView.render()
      clock.tick(100)
      mainView.showLoader.should.have.been.called

  describe 'renderTextSearch', ->
    it 'should attach textSearch to mainView', ->
      mainView.$('.text-search-placeholder').find('.search-input').length.should.equal 1

    it 'should add textSearch view to facetViews map', ->
      mainView.facetViews.hasOwnProperty('textSearch').should.be.ok
      mainView.facetViews.textSearch.should.be.instanceof TextSearch

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

  describe 'updateFacets', ->
    it 'should return false if textSearch is simple', ->
      config.textSearch = 'simple'
      mainView.updateFacets().should.not.be.ok

    it 'should hide the loader', ->
      mainView.renderFacets = setup.sinon.spy()
      mainView.destroyFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.$('.loader').css('display').should.equal 'none'

    it 'should call destroyFacets and renderFacets after first searchResult', ->
      mainView.model.searchResults.queryAmount = 1
      mainView.model.searchResults.current = new Backbone.Model(reset: false)
      mainView.destroyFacets = setup.sinon.spy()
      mainView.renderFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.destroyFacets.should.have.been.called
      mainView.renderFacets.should.have.been.called

    it 'should call destroyFacets and renderFacets after first searchResult', ->
      mainView.model.searchResults.queryAmount = 12
      mainView.model.searchResults.current = new Backbone.Model(reset: true)
      mainView.destroyFacets = setup.sinon.spy()
      mainView.renderFacets = setup.sinon.spy()
      mainView.updateFacets()
      mainView.destroyFacets.should.have.been.called
      mainView.renderFacets.should.have.been.called

    it 'should call update after second searchResult', ->
      mainView.model.searchResults.queryAmount = 2
      mainView.model.searchResults.current = new Backbone.Model(reset: false)
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