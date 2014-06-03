Backbone = require 'backbone'
_ = require 'underscore'

ajax = require 'hilib/src/managers/ajax'

config = require '../config'

class SearchResult extends Backbone.Model

  defaults: ->
    _next: null
    _prev: null
    ids: []
    numFound: null
    results: []
    rows: null
    solrquery: ''
    sortableFields: []
    start: null
    term: ''

module.exports = SearchResult