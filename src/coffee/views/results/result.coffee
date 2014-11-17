Backbone = require 'backbone'

tpl = require './result.jade'

###
@class Result
@extends Backbone.View
###
class Result extends Backbone.View

	className: 'result'

	tagName: 'li'

	###
	@param {object} [options={}]
	@prop {object} options.data - The data of the result.
	@prop {boolean} [options.fulltext=false] - Is the result coming from a full text search?
	@constructs
	###
	initialize: (@options={}) ->
		@options.fulltext ?= false
		if @options.fulltext then @$el.addClass 'fulltext' else @$el.addClass 'no-fulltext'

		@render()

	render: ->
		found = []
		found.push "#{count}x #{term}" for own term, count of @options.data.terms
	
		if @options.config.get('templates').hasOwnProperty 'result'
			tpl = @options.config.get('templates').result

		rtpl = tpl
			data: @options.data
			fulltext: @options.fulltext
			found: found.join(', ')

		@$el.html rtpl

		@

	events: ->
		'click': '_handleClick'
		'click li[data-layer]': '_handleLayerClick'

	_handleClick: (ev) ->
		@trigger 'click', @options.data

	_handleLayerClick: (ev) ->
		ev.stopPropagation()
		layer = ev.currentTarget.getAttribute 'data-layer'
		
		@trigger 'layer:click', layer, @options.data

	destroy: ->
		@remove()

module.exports = Result


### TEMPLATE FOR CUSTOM RESULT

class Result extends Backbone.View

	className: 'result'

	tagName: 'li'

	initialize: (@options={}) ->
		@options.fulltext ?= false
		if @options.fulltext then @$el.addClass 'fulltext' else @$el.addClass 'no-fulltext'

		@render()

	render: ->
		found = []
		found.push "#{count}x #{term}" for own term, count of @options.data.terms

		data = _.extend @options,
			data: @options.data
			found: found.join(', ')

		rtpl = tpl data
		@$el.html rtpl

		@

	events: ->
		'click': '_handleClick'

	_handleClick: (ev) ->
		@trigger 'click', @options.data

	destroy: ->
		@remove()

/TEMPLATE ###