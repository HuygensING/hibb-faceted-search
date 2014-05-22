chai = require 'chai'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
requireJade = require 'require-jade'
jsdom = require 'jsdom'

global.window = jsdom.jsdom().createWindow()
global.document = window.document
global.$ = require 'jquery'
global.Backbone = require 'backbone'
global.Backbone.$ = $
global._= require 'underscore'
global.basePath = if process.env.COVERAGE then '../../../coverage/' else '../../../src/coffee/'

chai.should()
chai.use sinonChai

module.exports.sinon = sinon