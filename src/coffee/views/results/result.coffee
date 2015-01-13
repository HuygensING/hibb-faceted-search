Backbone = require 'backbone'

tpl = require './result.jade'

###
# The view of one result item < li >.
#
# @class Result
# @namespace Views
# @todo Rename to ResultItem
###
class Result extends Backbone.View
	###
	# @property
	# @type {String}
	###
	className: 'result'

	###
	# @property
	# @type {String}
	###
	tagName: 'li'

	###
	# @method
	# @construct
	# @param {Object} this.options
	# @param {Object} this.options.data The data of the result.
	# @param {Boolean} [this.options.fulltext=false] Is the result coming from a full text search?
	###
	initialize: (@options) ->
		@options.fulltext ?= false
		if @options.fulltext then @$el.addClass 'fulltext' else @$el.addClass 'no-fulltext'

		@render()

	###
	# @method
	# @chainable
	# @return {Result}
	###
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

	###
	# @method
	###
	events: ->
		'click': '_handleClick'
		'click li[data-layer]': '_handleLayerClick'

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	_handleClick: (ev) ->
		@trigger 'click', @options.data

	###
	# @method
	# @private
	# @return {Object} ev The event object.
	###
	_handleLayerClick: (ev) ->
		ev.stopPropagation()
		layer = ev.currentTarget.getAttribute 'data-layer'
		
		@trigger 'layer:click', layer, @options.data

	###
	# @method
	###
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