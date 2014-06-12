setup = require '../setup'

Facets = require "../#{basePath}views/facets"
FacetView = require "../#{basePath}views/facets/main"
Main = require "../#{basePath}main"

describe 'View: Facets ::', ->
  facetsView = null

  beforeEach ->
    facetsView = new Facets {}

  describe 'initialize :::', ->
    it 'should extend the viewMap', ->
      facetsView = new Facets
        viewMap:
          MYRANGE: 'someViewObj'
      facetsView.viewMap.should.have.ownProperty 'MYRANGE'
      facetsView.viewMap.MYRANGE.should.equal 'someViewObj'

    it 'should initialize an empty views object', ->
      facetsView.views.should.eql {}

#    WRONG DOCUMENT ERROR
#  describe 'render', ->
#    el = document.createElement 'div'
#    facetsDiv = document.createElement 'div'
#    facetsDiv.className = 'facets'
#    el.appendChild facetsDiv
#
#    it 'should render facets', ->
#      args = [
#        name: 'testListFacet'
#        type: 'LIST'
#        title: 'Test list facet'
#        options: [
#          name: 'testsome'
#          count: 12
#          checked: false
#        ,
#          name: 'testmore'
#          count: 6
#          checked: false
#        ]
#      ,
#        name: 'testBooleanFacet'
#        type: 'BOOLEAN'
#        title: 'Test boolean facet'
#        options: [
#          name: 'testsome'
#          count: 12
#          checked: false
#        ,
#          name: 'testmore'
#          count: 6
#          checked: false
#        ]
#      ]
#
#      facetsView.render el, args


  describe 'renderFacet :::', ->
    args =
      name: 'testListFacet'
      type: 'LIST'
      title: 'Test list facet'

    it 'should return a facetView', ->
      facetsView.renderFacet(args).should.be.instanceof FacetView


    it 'should add facetView to facetsView.views map', ->
      facetsView.renderFacet(args)
      facetsView.views.should.have.ownProperty 'testListFacet'

    it 'should trigger change event when facetView change event is triggered', ->
      stub = setup.sinon.stub facetsView, 'trigger'
      facetsView.renderFacet args
      facetsView.views[args.name].trigger 'change'
      stub.should.have.been.calledWith 'change'

    it 'should return the facetView', ->
      facetsView.renderFacet(args).should.equal facetsView.views[args.name]