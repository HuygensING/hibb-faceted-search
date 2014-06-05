chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
requireJade = require 'require-jade'
jsdom = require('jsdom').jsdom

doc = jsdom '<html><body></body></html>'
global.window = doc.createWindow()
global.document = global.window.document

global.$ = require('jquery')(global.window)
global._ = require 'underscore'
global.Backbone = require 'backbone'
global.Backbone.$ = global.$



#.create(window) # WARNING: jQuery for testing is 1.8.3 - different to app


#jsdom.jQueryify window, "http://code.jquery.com/jquery.js", runTests


#global.window = jsdom.jsdom().createWindow()
#global.document = window.document
global.localStorage = global.sessionStorage = require 'localStorage'
#global.$ = require 'jquery'
#global._= require 'underscore'
global.basePath = if process.env.COVERAGE then '../../coverage/' else '../../src/coffee/'
#
chai.should()
chai.use sinonChai
#
module.exports.sinon = sinon