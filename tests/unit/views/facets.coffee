setup = require '../setup'

Facets = require "../#{basePath}views/facets"
FacetView = require "../#{basePath}views/facets/main"

describe 'View: Facets ::', ->
  facetsView = null

  beforeEach ->
    facetsView = new Facets {}

  describe 'renderFacet :::', ->
    args =
      name: 'testFacet'
      type: 'LIST'
      title: 'Test facet'
    it 'should return a facetView', ->
      facetsView.renderFacet(args).should.be.instanceof FacetView

    it 'should add facetView to facetsView.views map', ->
      facetsView.renderFacet(args)
      facetsView.views.should.have.ownProperty 'testFacet'