global.chai = require 'chai'
#global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
#console.log global.XMLHttpRequest
global.sinon = require 'sinon'
#require("sinon/lib/sinon/util/fake_xml_http_request")

sinonChai = require 'sinon-chai'
requireJade = require 'require-jade'
global.jsdom = require('jsdom').jsdom

MainView = require './src/coffee/main'


doc = jsdom '<html><body></body></html>'
global.window = doc.createWindow()
global.document = global.window.document

global.$ = require('jquery')(global.window)
global._ = require 'underscore'
global.Backbone = require 'backbone'
global.Backbone.$ = global.$
global.localStorage = global.sessionStorage = require 'localStorage'

chai.should()
chai.use sinonChai

describe 'MainView', ->
  mainView = null
  before ->
    mainView = new MainView
      el: document.querySelector('body')
      textSearch: 'simple'
#    @xhr = sinon.useFakeXMLHttpRequest()
#    requests = @requests = []
#    @xhr.onCreate = (xhr) ->
#      requests.push xhr

  after ->
#    @xhr.restore()


  describe 'renderTextView', ->
    it 'should have a textSearch subview', ->
      mainView.textSearch.should.exist

    it 'should set queryOptions when textSearch changes', ->
      spy = sinon.spy mainView.queryOptions, 'set'
      mainView.textSearch.trigger 'change', qo: 'qo'
      mainView.queryOptions.set.should.have.been.calledWith qo: 'qo'

    # We don't want to test if searchResults.runQuery is called,
    # but there is no way to test if mainView.search is called,
    # because we cannot spy it, because of Backbone.
    it 'should call search when textSearch button clicked', ->
      stub = sinon.stub mainView.searchResults, 'runQuery'
      mainView.textSearch.trigger 'search'
      stub.should.have.been.called