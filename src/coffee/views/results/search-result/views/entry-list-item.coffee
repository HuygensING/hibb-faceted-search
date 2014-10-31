_ = require 'underscore'

Fn = require 'hilib/src/utils/general'

Base = require 'hilib/src/views/base'

config = require '../../../models/config'

# Tpl = require 'text!html/entry/metadata.html'
tpl = require '../templates/entry-list-item.jade'

# @options
# 	fulltext	Boolean		Is the list a result of a fulltext search? Defaults to false.

# ## EntryMetadata
class EntryListItem extends Base

	className: 'entry'

	tagName: 'li'

	# ### Initialize
	initialize: (@options={}) ->
		super

		@options.fulltext ?= false
		if @options.fulltext then @$el.addClass 'fulltext' else @$el.addClass 'no-fulltext'

		@render()

	# ### Render
	render: ->
		found = []
		found.push "#{count}x #{term}" for own term, count of @options.entryData.terms

		data = _.extend @options,
			entryData: @options.entryData
			generateID: Fn.generateID
			found: found.join(', ')

		rtpl = tpl data
		@$el.html rtpl

		@

	# ### Events
	events: ->
		'click': (ev) ->
			unless @$el.hasClass 'fulltext'
				if @$('.default-mode').is(":visible")
					config.set 'activeTextLayerId', null
					@trigger 'click', @options.entryData.id, @options.entryData.terms
				else if @$('.edit-mode').is(":visible")
					unless ev.target.getAttribute('type') is 'checkbox'
						@$('input')[0].checked = !@$('input')[0].checked
					@trigger 'check', @options.entryData.id

		'click .keywords > ul > li': (ev) ->
			config.set 'activeTextLayerId', ev.currentTarget.getAttribute 'data-textlayer'
			@trigger 'click', @options.entryData.id, @options.entryData.terms, ev.currentTarget.getAttribute 'data-textlayer'

module.exports = EntryListItem