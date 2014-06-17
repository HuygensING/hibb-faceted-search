chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
requireJade = require 'require-jade'
jsdom = require('jsdom').jsdom

doc = jsdom '<html><body></body></html>'
global.window = doc.createWindow()
global.document = global.window.document

global.$ = require 'jquery'
global._ = require 'underscore'
global.Backbone = require 'backbone'

global.localStorage = global.sessionStorage = require 'localStorage'
global.basePath = if process.env.COVERAGE then '../../coverage/coffee/' else '../../src/coffee/'

chai.should()
chai.use sinonChai

module.exports.sinon = sinon
module.exports.jsdom = jsdom