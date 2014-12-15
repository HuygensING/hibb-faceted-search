Backbone = require 'backbone'

class Config extends Backbone.Model
	###
	@prop {object} [facetTitleMap={}] - Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
	@prop {string[]} [facetOrder=[]] - Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
	@prop {boolean} [results=false] - Render the results. When kept to false, the showing of the results has to be taken care of in the application.
	@prop {string} [entryTermSingular="entry"] - Name of one result, for example: book, woman, country, alumnus, etc.
	@prop {string} [entryTermPlural="entries"] - Name of multiple results, for example: books, women, countries, alunmi, etc.
	@prop {boolean} [sortLevels=true] - Render sort levels in the results header
	@prop {boolean} [showMetadata=true] - Render show metadata toggle in the results header
	###
	defaults: ->
		# Number of results per query/page. The backend returns resultRows
		# of results and the results page displays this amount as well.
		resultRows: 10

		# TODO: Merge baseUrl & searchPath into searchUrl, elaborate uses baseUrl + searchPath, publication collection uses
		# searchPath only. If elaborate uses baseUrl & searchPath, concat them by hand before sending to FS.
		baseUrl: ''

		searchPath: ''

		# textSearch has three options: 'none', 'simple', 'advanced'
		# none: text search is hidden, facets are shown, loader is shown
		# simple: text search is shown, facets are hidden, loader is hidden
		# advanced: text search is shown, facets are shown, loader is shown
		textSearch: 'advanced'

		authorizationHeaderToken: null

		queryOptions: {}
		# * resultRows

		facetTitleMap: {}
		facetOrder: []

		# The templates config is a hash of templates. The templates should be
		# functions which take a hash as argument to render vars.
		#
		# Possible templates:
		# - main
		# - facets
		# - text-search
		# - facets.main
		# - list.menu
		# - list.body
		# - range.body
		templates: {}

		# When set to true, a search is performed whenever the mainModel (queryOptions) change.
		autoSearch: true

		# The requestOptions object is used for extra options to the POST query call,
		# such as setting custom headers (e.g., VRE_ID).
		requestOptions: {}

		results: false
		sortLevels: true
		showMetadata: true

		entryTermSingular: 'entry'
		entryTermPlural: 'entries'

		# A list of all the entries metadata fields. This list corresponds
		# to the facets and is used to populate the sortLevels in the 
		# result view.
		entryMetadataFields: []

		# An array of max three strings. Determine the three levels
		# of sorting the results. The three levels are entry metadata
		# fields and are also present in the entryMetadataFields array.
		levels: []

		sortableFields: []

# Config is not a singleton, because it must be possible to have
# multiple faceted searches which don't share a config.
module.exports = Config
