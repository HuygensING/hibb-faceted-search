setup = require './setup'

funcky = require 'funcky.el'

QueryOptions = require basePath + 'models/query-options'
SearchResults = require basePath + 'collections/searchresults'
TextSearch = require basePath + 'views/text-search'
FacetView = require basePath + 'views/facets/main'
FacetsView = require basePath + 'views/facets'
Main = require basePath + 'main'
config = require basePath + 'config'

describe 'View : Main ::', ->
  mainView = null

  beforeEach ->
    mainView = new Main()

  afterEach ->
    config.textSearch = 'advanced'

  describe 'initialize :::', ->
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

    it 'should render textSearch when search type is simple', ->
      mainView = new Main textSearch: 'simple'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.have.been.called

    it 'should not render textSearch when search type is none', ->
      mainView = new Main textSearch: 'none'
      mainView.renderTextSearch = setup.sinon.spy()
      mainView.render()
      mainView.renderTextSearch.should.not.have.been.called

  describe 'renderTextView :::', ->
    it 'should attach textSearch to mainView', ->
      mainView.$('.text-search-placeholder').find('.search-input').length.should.equal 1

    it 'should set queryOptions when textSearch changes', ->
      spy = setup.sinon.spy mainView.queryOptions, 'set'
      mainView.textSearch.trigger 'change', qo: 'qo'
      mainView.queryOptions.set.should.have.been.calledWith qo: 'qo'

    # We don't want to test if searchResults.runQuery is called,
    # but there is no way to test if mainView.search is called,
    # because we cannot spy it, because of Backbone.
    it 'should call search when textSearch button clicked', ->
      stub = setup.sinon.stub mainView, 'search'
      mainView.textSearch.trigger 'search'
      stub.should.have.been.called

  describe 'onSwitchType :::', ->
    ev = preventDefault: ->

    it 'should set config.textSearch to simple if config.textSearch is advanced', ->
      stub = setup.sinon.stub mainView, 'search'
      config.textSearch = 'advanced'
      mainView.onSwitchType ev
      config.textSearch.should.equal 'simple'

    it 'should set config.textSearch to advanced if config.textSearch is simple', ->
      stub = setup.sinon.stub mainView, 'search'
      config.textSearch = 'simple'
      mainView.onSwitchType ev
      config.textSearch.should.equal 'advanced'

    it 'should call search if queryAmount is 1', ->
      mainView.searchResults.queryAmount = 1
      stub = setup.sinon.stub mainView, 'search'
      mainView.onSwitchType ev
      stub.should.have.been.called

    it 'should call update if queryAmount > 1', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView, 'update'
      mainView.searchResults.queryAmount = 12
      mainView.onSwitchType ev
      searchStub.should.not.have.been.called
      stub.should.have.been.called

  describe 'onReset', ->
    it 'should call @reset', ->
      stub = setup.sinon.stub mainView, 'reset'
      ev =
        preventDefault: ->
      mainView.onReset ev
      stub.should.have.been.called

  describe 'destroy :::', ->
    it 'should call destroy on facetsView', ->
      stub = setup.sinon.stub mainView.facets, 'destroy'
      mainView.destroy()
      stub.should.have.been.called

    it 'should call destroy on textSearch', ->
      stub = setup.sinon.stub mainView.textSearch, 'destroy'
      mainView.destroy()
      stub.should.have.been.called

    it 'should call remove', ->
      stub = setup.sinon.stub mainView, 'remove'
      mainView.destroy()
      stub.should.have.been.called

  describe 'extendConfig', ->
    it 'should default search type to advanced', ->
      mainView = new Main textSearch: 'some-non-existent-text-search-type'
      config.textSearch.should.equal 'advanced'

  describe 'instantiateQueryOptions :::', ->
    it 'should have a model of instance QueryOptions', ->
      mainView.queryOptions.should.be.instanceof QueryOptions

    it 'should not call search when queryOptions change if autoSearch is false', ->
      mainView = new Main autoSearch: false
      stub = setup.sinon.stub mainView, 'search'
      mainView.queryOptions.trigger 'change'
      stub.should.not.have.been.called

    it 'should call search when queryOptions change if autoSearch is true', ->
      mainView = new Main autoSearch: true
      stub = setup.sinon.stub mainView, 'search'
      mainView.queryOptions.trigger 'change'
      stub.should.have.been.called

  describe 'instantiateSearchResults :::', ->
    it 'should have a collection of instance SearchResults', ->
      mainView.searchResults.should.be.instanceof SearchResults

    it 'should call @update if results change', ->
      stub = setup.sinon.stub mainView, 'update'
      mainView.searchResults.trigger 'change:results'
      stub.should.have.been.called

    it 'should trigger change:results event if results change', ->
      updateStub = setup.sinon.stub mainView, 'update'
      triggerStub = setup.sinon.stub mainView, 'trigger'
      responseModel = new Backbone.Model()
      mainView.searchResults.trigger 'change:results', responseModel
      triggerStub.should.have.been.calledWith 'change:results', responseModel

    it 'should trigger change:results event when cursor changes', ->
      triggerStub = setup.sinon.stub mainView, 'trigger'
      responseModel = new Backbone.Model()
      mainView.searchResults.trigger 'change:cursor', responseModel
      triggerStub.should.have.been.calledWith 'change:results', responseModel

    it 'should trigger change:page event when page changes', ->
      triggerStub = setup.sinon.stub mainView, 'trigger'
      responseModel = new Backbone.Model()
      mainView.searchResults.trigger 'change:page', responseModel, 'mydb'
      triggerStub.should.have.been.calledWith 'change:page', responseModel, 'mydb'

    it 'should show call @showLoader when the request event is triggered', ->
      stub = setup.sinon.stub mainView, 'showLoader'
      mainView.searchResults.trigger 'request'
      stub.should.have.been.called

    it 'should show call @hideLoader when the sync event is triggered', ->
      stub = setup.sinon.stub mainView, 'hideLoader'
      mainView.searchResults.trigger 'sync'
      stub.should.have.been.called

    it 'should show trigger unauthorized event when unauthorized event is triggered', ->
      stub = setup.sinon.stub mainView, 'trigger'
      mainView.searchResults.trigger 'unauthorized'
      stub.should.have.been.calledWith 'unauthorized'


  describe 'instantiateFacets :::', ->
    it 'should attach FacetsView to mainView ', ->
      mainView.facets.should.be.instanceof FacetsView

    it 'should set queryOptions when textSearch changes', ->
      stub = setup.sinon.stub mainView.queryOptions, 'set'
      mainView.facets.trigger 'change', {}
      mainView.queryOptions.set.should.have.been.called

  describe 'showLoader :::', ->
    it 'should return false if loader is already visible', ->
      mainView.$('.overlay').css 'display', 'block'
      mainView.showLoader().should.not.be.ok

  describe 'hideLoader :::', ->
    it 'should set overlay to display: none', ->
      mainView.$('.overlay').css 'display', 'block'
      mainView.hideLoader()
      mainView.$('.overlay').css('display').should.equal 'none'

  describe 'update :::', ->
    it 'should render facets after the first searchResult', ->
      stub = setup.sinon.stub mainView.facets, 'render'
      mainView.searchResults.current = get: ->

      mainView.searchResults.queryAmount = 1
      mainView.update()
      mainView.facets.render.should.have.been.called

    it 'should update facets after next searchResults', ->
      stub = setup.sinon.stub mainView.facets, 'update'
      mainView.searchResults.current = get: ->

      mainView.searchResults.queryAmount = 12
      mainView.update()
      mainView.facets.update.should.have.been.called

  describe 'page :::', ->
    it 'should call page method on searchResults', ->
      stub = setup.sinon.stub mainView.searchResults, 'page'
      mainView.page 12, 'remdoc'
      mainView.searchResults.page.should.have.been.calledWith 12, 'remdoc'

  describe 'next :::', ->
    it 'should call moveCursor on searchResults', ->
      stub = setup.sinon.stub mainView.searchResults, 'moveCursor'
      mainView.next()
      mainView.searchResults.moveCursor.should.have.been.calledWith '_next'

  describe 'prev :::', ->
    it 'should call moveCursor on searchResults', ->
      stub = setup.sinon.stub mainView.searchResults, 'moveCursor'
      mainView.prev()
      mainView.searchResults.moveCursor.should.have.been.calledWith '_prev'

  describe 'hasNext :::', ->
    it 'should call moveCursor on searchResults', ->
      mainView.searchResults.current = new Backbone.Model _next: true
      mainView.hasNext().should.be.ok

  describe 'hasPrev :::', ->
    it 'should call moveCursor on searchResults', ->
      mainView.searchResults.current = new Backbone.Model _notaprev: true
      mainView.hasPrev().should.not.be.ok

  describe 'sortResultsBy :::', ->
    it 'should call set on queryOptions with the sort field', ->
      stub = setup.sinon.stub mainView.queryOptions, 'set'
      mainView.sortResultsBy 'toetersenbellen'
      stub.should.have.been.calledWith sort: 'toetersenbellen'

  describe 'reset :::', ->
    it 'should call reset on textSearch if textSearch exists', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView.textSearch, 'reset'
      mainView.reset()
      stub.should.have.been.called

    it 'should call reset on facets', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView.facets, 'reset'
      mainView.reset()
      stub.should.have.been.called

    it 'should call reset on queryOptions', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView.queryOptions, 'reset'
      mainView.reset()
      stub.should.have.been.called

    it 'should clear searchResults cache if cache is set to false', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView.searchResults, 'clearCache'
      mainView.reset()
      stub.should.have.been.called

    it 'should not clear searchResults cache if cache is set to true', ->
      searchStub = setup.sinon.stub mainView, 'search'
      stub = setup.sinon.stub mainView.searchResults, 'clearCache'
      mainView.reset true
      stub.should.not.have.been.called

    it 'should call new search', ->
      stub = setup.sinon.stub mainView, 'search'
      mainView.reset()
      stub.should.have.been.called

  describe 'search :::', ->
    it 'should runQuery with queryOptions attributes and wait: true', ->
      stub = setup.sinon.stub mainView.searchResults, 'runQuery'
      mainView.search()
      stub.should.have.been.calledWith mainView.queryOptions.attributes