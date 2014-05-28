setup = require '../../setup'

FacetList = require "../../#{basePath}views/facets/list"

describe 'View FacetList', ->
  list = null
  options = JSON.parse '{"attrs":{"name":"content_type","title":"Content Type","type":"LIST","options":[{"name":"publications (all)","count":3047},{"name":"works of art","count":1953},{"name":"books/e-books","count":1656},{"name":"painting","count":1040},{"name":"articles in magazines/journals","count":646},{"name":"drawing","count":639},{"name":"newspaper articles","count":531},{"name":"book reviews","count":326},{"name":"notarial acts","count":320},{"name":"municipal records","count":182},{"name":"personal accounts (manuscripts)","count":178},{"name":"reproductive print","count":163},{"name":"baptism, marriage and burial records","count":113},{"name":"court records","count":103},{"name":"print","count":48},{"name":"color drawing","count":40},{"name":"dissertations/theses","count":31},{"name":"school records","count":16},{"name":"overmantel","count":11},{"name":"church records","count":8},{"name":"decorative wall component","count":5},{"name":"reference material/other media","count":5},{"name":"oil sketch","count":3},{"name":"overdoor","count":3},{"name":"wallpaper painting","count":3},{"name":"altarpiece","count":2},{"name":"interior (as artwork)","count":2},{"name":"portrait miniature","count":2},{"name":"series","count":1},{"name":"triptych","count":1},{"name":"unfinished painting","count":1},{"name":"mezzotint","count":1}]}}'

  beforeEach ->
    list = new FacetList options

  describe 'initialize', ->
    it 'should create a model', ->
      list.model.should.exist

    it 'should create a collection', ->
      list.collection.should.exist

    it 'should call render', ->
      list.render = setup.sinon.spy()
      list.initialize options
      list.render.should.have.been.called

  describe 'reset', ->
    it 'should call revert on the collection', ->
      list.collection.revert = setup.sinon.spy()
      list.reset()
      list.collection.revert.should.have.been.called
