Backbone = require 'backbone'
config = require '../../config'

class Facet extends Backbone.Model

  idAttribute: 'name'

  defaults: ->
    name: null
    title: null
    type: null
    options: null

module.exports = Facet