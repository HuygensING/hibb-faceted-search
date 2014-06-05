chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
requireJade = require 'require-jade'
jsdom = require('jsdom').jsdom

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

mainView = new MainView el: document.querySelector('body')

describe 'MainView', ->
  describe 'renderTextView', ->
    it 'should have a textSearch subview', ->
      mainView.textSearch.should.exist
      mainView.search = sinon.spy()
      mainView.textSearch.trigger 'search'
      mainView.search.should.have.been.called
