define (require) ->

	Models =
		Facet: require 'models/facet'

	class DateFacet extends Models.Facet

		parse: (attrs) ->
			console.log attrs
			attrs.options = _.map _.pluck(attrs.options, 'name'), (option) -> option.substr 0, 4
			attrs.options = _.unique attrs.options
			attrs.options.sort()
			attrs