Backbone = require 'backbone'
_ = require 'underscore'
$ = require 'jquery'

assert = require 'assert'

#tpl = require '../../jade/facets.jade'

###
# @class
# @namespace Views
# @uses Config
###
class Facets extends Backbone.View

	###
	# @property
	# @type {String}
	###
	className: 'facets'

	###
	# Hash of facet views. The faceted search has several types build-in,
	# which are the defaults, but this map can be extended, to add or override
	# facet views.
	#
	# @property
	# @type {Object} Keys are types in capital, values are Backbone.Views.
	# @example {BOOLEAN: MyBooleanView, LIST: MyListView}
	# @todo Move to external module.
	###
	viewMap: {
		BOOLEAN: require './facets/boolean'
		RANGE: require './facets/range'
		LIST: require './facets/list'
	}

	###
	# @property
	# @type {Object}
	###
	views: null

	###
	# @constructs
	# @param {Object} this.options
	# @param {Object} this.options.viewMap
	# @param {Config} this.options.config
	###
	initialize: (@options) ->
		_.extend @viewMap, @options.viewMap

		# A map of the facet views. Used for looping through all facet views
		# and call methods like update, reset and render.
		@views = {}

		@render()

	###
	# @method
	# @override
	# @chainable
	# @return {Facets} Instance of Facets to enable chaining.
	###
	render: ->
		if @options.config.get('templates').hasOwnProperty 'facets'
			tpl = @options.config.get('templates').facets
			@el.innerHTML = tpl()

		@

	###
	# @method
	# @param {Object} data 
	###
	renderFacets: (data) ->
		@_destroyFacets()

		# If there is a template for main, than use the template and
		# attach facets to their placeholder.
		if @options.config.get('templates').hasOwnProperty 'facets'
			for facetData, index in data
				if @viewMap.hasOwnProperty facetData.type
					placeholder = @el.querySelector(".#{facetData.name}-placeholder")

					if placeholder?
						placeholder.parentNode.replaceChild @_renderFacet(facetData).el, placeholder
		# If there is no template for main, create a document fragment and append
		# all facets to it and attach it to the DOM.
		else
			facets = new Backbone.Collection data,
				model: Backbone.Model.extend idAttribute: 'name'

			if @options.config.get('facetOrder').length is 0
				@options.config.set facetOrder: facets.pluck 'name'

			fragment = document.createDocumentFragment()
			for facetName in @options.config.get('facetOrder')
				assert.ok facets.get(facetName)?, "FacetedSearch :: config.facetOrder : Unknown facet name: \"#{facetName}\"!"
				facet = facets.get facetName

				if @viewMap.hasOwnProperty facet.get('type')
					fragment.appendChild @_renderFacet(facet.attributes).el
					# fragment.appendChild document.createElement 'hr'
				else
					console.error 'Unknown facetView', facet.get('type')

			@el.innerHTML = ''
			@el.appendChild fragment

		@_postRenderFacets()
		

		@

	###
	# @method
	# @private
	# @param {Object} facetData
	###
	_renderFacet: (facetData) =>
		if _.isString(facetData)
			facetData = _.findWhere @searchResults.first().get('facets'), name: facetData

		View = @viewMap[facetData.type]
		@views[facetData.name] = new View
			# attrs: @_parseFacetData(facetData),
			attrs: facetData
			config: @options.config

		@listenTo @views[facetData.name], 'change', (queryOptions, options={}) =>
			@trigger 'change', queryOptions, options

		@views[facetData.name]

	###
	# @method
	# @private
	###
	_postRenderFacets: ->
		for facetName, view of @views
			if @options.config.get('collapse')
				view.collapse()
			view.postRender()

	###
	# @method
	# @param {Object} facetData
	###
	update: (facetData) ->
		for own viewName, view of @views
			data = _.findWhere(facetData, name: viewName)
			options = if data? then data.options else []

			view.update options

	###
	# @method
	###
	reset: ->
		for own key, facetView of @views
			facetView.reset() if typeof facetView.reset is 'function'

	###
	# @method
	# @private
	###
	_destroyFacets: ->
		@stopListening()

		for own viewName, view of @views
			view.destroy()
			delete @views[viewName]

	###
	# Destroy the child views (facets) and remove the view.
	#
	# @method
	###
	destroy: ->
		@_destroyFacets()
		@remove()

	###
	# The facets are slided one by one. When the slide of a facet is finished, the
	# next facet starts sliding. That's why we use a recursive function.
	#
	# @method
	# @param {Object} ev The event object.
	###
	toggle: (ev) ->
		ev.preventDefault()

		icon = $(ev.currentTarget).find('i.fa')
		span = $(ev.currentTarget).find('button span')

		open = icon.hasClass 'fa-expand'
		icon.toggleClass 'fa-compress'
		icon.toggleClass 'fa-expand'

		text = if open then 'Collapse' else 'Expand'
		span.text "#{text} filters"

		@slideFacets open

	###
	# Slide the facets down/open or up/close.
	#
	# @param {Bool} down Slide down (expand, open) or slide up (collapse, close).
	###
	slideFacets: (down=true) ->
		facetNames = _.keys @views
		index = 0

		slideFacet = =>
			facetName = facetNames[index++]
			facet = @views[facetName]

			if facet?
				if down
					facet.showBody ->
						slideFacet()
				else
					facet.hideBody ->
						slideFacet()

		slideFacet()

module.exports = Facets