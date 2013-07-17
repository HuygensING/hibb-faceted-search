define (require) ->

	Models = 
			FacetedSearch: require 'models/main'
			# options: require 'models/options'

	Views =
			Base: require 'views/base'
			List: require 'views/facets/list'
			Search: require 'views/search'

	Templates =
			FacetedSearch: require 'text!html/faceted-search.html'

	class FacetedSearch extends Views.Base
		facetData: []
		facetViews: {}

		initialize: (options) ->
			super # ANTIPATTERN

			@model = new Models.FacetedSearch options


			# Models.query.baseUrl = @options.baseUrl
			# Models.query.searchUrl = @options.searchUrl
			# Models.query.token = @options.token

			# TMP: cuz of a bug in r.js Backbone must be build with the faceted-search
			# But that means a project and the faceted-search are using two different instances of Backbone
			# and thus publish/subscribe will not work
			@subscribe 'faceted-search:results', (results) =>
				console.log results
				@renderFacets results
				@trigger 'faceted-search:results', results

			@subscribe 'unauthorized', => @trigger 'unauthorized'

			@render()

		render: ->
			rtpl = _.template Templates.FacetedSearch
			@$el.html rtpl

			if @model.get 'search'
				search = new Views.Search()
				@$('.search-placeholder').html search.$el

			# TODO: Show message to user when render fails
			@model.fetch()

			@

		renderFacets: (data) ->
			# console.log data
			# @$('.facets').html ''

			# TODO: Add Views.List to Collections.Facets
			# TODO: Add Views.Boolean
			if not @facetData.length
				@facetData = data.facets

				for own index, data of data.facets
					@facetViews[data.name] = new Views.List attrs: data
					@$('.facets').append @facetViews[data.name].$el
			else
				for own index, data of data.facets
					@facetViews[data.name].update(data.options)
				# view.update data.facets




# define (require) ->

# 	Models = 
# 		options: require 'models/options'

# 	Views =
# 		FS: require 'views/main'

# 	(options) ->
# 		Models.options.extendDefaults options

# 		new Views.FS options