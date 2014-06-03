setup = require './setup'

QueryOptions = require basePath + 'models/query-options'
SearchResults = require basePath + 'collections/searchresults'
TextSearch = require basePath + 'views/text-search'
FacetView = require basePath + 'views/facets/main'
Main = require basePath + 'main'
config = require basePath + 'config'

describe 'View : Main ::', ->
  mainView = null

  beforeEach ->
    mainView = new Main()

  afterEach ->
    config.textSearch = 'advanced'

  describe 'initialize :::', ->
    it 'should have a model of instance QueryOptions', ->
      mainView.queryOptions.should.be.instanceof QueryOptions

    it 'should have a collection of instance SearchResults', ->
      mainView.searchResults.should.be.instanceof SearchResults



    it 'should call render', ->
      mainView.render = setup.sinon.spy()
      mainView.initialize()
      mainView.render.should.have.been.called

    it 'should call instantiateFacets with facetViewMap', ->
      mainView.instantiateFacets = setup.sinon.spy()
      mainView.initialize
        facetViewMap:
          FACETTYPE: 'someViewClass'
      mainView.instantiateFacets.should.have.been.calledWith FACETTYPE: 'someViewClass'

    it 'should extend config with options', ->
      mainView.initialize
        # add
        myattr: 'attr'
        # override
        autoSearch: false
        # nested add and override
        queryOptions:
          nonExistentAttr: ['some', 'sort', 'para']
          fuzzy: true

      config.should.have.ownProperty 'myattr'
      config.autoSearch.should.not.be.ok
      config.queryOptions.fuzzy.should.be.ok
      config.queryOptions.should.have.ownProperty 'nonExistentAttr'

    it 'should set search type to config', ->
      mainView = new Main textSearch: 'simple'
      config.textSearch.should.equal 'simple'

      mainView = new Main textSearch: 'advanced'
      config.textSearch.should.equal 'advanced'

      mainView = new Main textSearch: 'none'
      config.textSearch.should.equal 'none'

      mainView = new Main textSearch: 'some-non-existent-text-search-type'
      config.textSearch.should.equal 'advanced'

  describe 'render :::', ->
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

#    it 'should call showLoader when textSearch type is advanced', ->
#      mainView.showLoader = setup.sinon.spy()
#      mainView.render()
#      clock.tick(100)
#      mainView.showLoader.should.have.been.called

    it 'should render textSearch when search type is simple', ->
      mainView = new Main textSearch: 'simple'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.have.been.called

#    it 'should not call showLoader when textSearch type is simple', ->
#      mainView = new Main textSearch: 'simple'
#      mainView.showLoader = setup.sinon.spy()
#      mainView.render()
#      clock.tick(100)
#      mainView.showLoader.should.not.have.been.called

    it 'should not render textSearch when search type is none', ->
      mainView = new Main textSearch: 'none'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.not.have.been.called

#    it 'should call showLoader when textSearch type is none', ->
#      mainView = new Main textSearch: 'none'
#      mainView = new Main textSearch: 'none'
#      mainView.showLoader = setup.sinon.spy()
#      mainView.render()
#      clock.tick(100)
#      mainView.showLoader.should.have.been.called

  describe 'renderTextSearch :::', ->
    it 'should attach textSearch to mainView', ->
      mainView.$('.text-search-placeholder').find('.search-input').length.should.equal 1

#  describe 'reset', ->
#    it 'should call the main models reset method', ->
#      mainView.model.reset = setup.sinon.spy()
#
#      mainView.reset true
#      mainView.model.reset.should.have.been.calledWith true
#
#      mainView.reset false
#      mainView.model.reset.should.have.been.calledWith false

    # FIX How to test if it isn't called when no textSearch view exists?
    # When the sinon spy is created, the facetViews has a textSearch object
    # and it will be called by reset().
#    it 'should call the textSearch reset method if textSearch is loaded', ->
#      mainView.textSearch = {'id': 'dummyview'}
#      mainView.textSearch.reset = setup.sinon.spy()
#
#      mainView.reset()
#
#      mainView.textSearch.reset.should.have.been.called

