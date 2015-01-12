Backbone = require 'backbone'

###
# @class
# @namespace Models
###
class Config extends Backbone.Model
	###
	# Default attributes.
	#
	# Does not require any parameters, but the @param tag is (ab)used to document
	# the returned hash.
	#
	# @method
	# @param {String} baseUrl Base of the URL to perform searches.
	# @param {String} searchPath Path of the URL to perform searches.
	# @param {Number} [resultRows=10] Number of results per query/page.
	# @param {Object} [facetTitleMap={}] Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
	# @param {Array<String>} [facetOrder=[]] Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
	# @param {Boolean} [results=false] Render the results. When kept to false, the showing of the results has to be taken care of in the application.
	# @param {String} [termSingular="entry"] Name of one result, for example: book, woman, country, alumnus, etc.
	# @param {String} [termPlural="entries"] Name of multiple results, for example: books, women, countries, alunmi, etc.
	# @param {Boolean} [sortLevels=true] Render sort levels in the results header
	# @param {Boolean} [showMetadata=true] Render show metadata toggle in the results header
	# @param {String} [textSearch='advanced'] One of 'none', 'simple' or 'advanced'. None: text search is hidden, facets are shown, loader is shown. Simple: text search is shown, facets are hidden, loader is hidden. Advanced: text search is shown, facets are shown, loader is shown.
	# @param {Object} [textSearchOptions] Options that are passed to the text search component
	# @param {Boolean} [textSearchOptions.caseSensitive=false] Render caseSensitive option?
	# @param {Boolean} [textSearchOptions.fuzzy=false] Render fuzzy option?
	# @param {Array<Object>} [textSearchOptions.fullTextSearchParameters] Objects passed have a name and term attribute. Used for searching multiple fields.
	# @param {Object} labels Hash of labels, used in the interface. Quick 'n dirty way to change the language.
	# @return {Object} A hash of options and their values. Documentated as @param's.
	###
	defaults: ->
		resultRows: 10

		baseUrl: ''
		searchPath: ''

		textSearch: 'advanced'
		textSearchOptions:
			caseSensitive: false
			fuzzy: false
			
		labels:
			fullTextSearchFields: "Search in"
			numFound: "Found"
			filterOptions: "Filter options"
			sortAlphabetically: "Sort alphabetically"
			sortNumerically: "Sort numerically"

		authorizationHeaderToken: null

		queryOptions: {}

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

		termSingular: 'entry'
		termPlural: 'entries'

		# A list of all the entries metadata fields. This list corresponds
		# to the facets and is used to populate the sortLevels in the 
		# result view.
		entryMetadataFields: []

		# An array of max three strings. Determine the three levels
		# of sorting the results. The three levels are entry metadata
		# fields and are also present in the entryMetadataFields array.
		levels: []

		# sortableFields: []

# Config is not a singleton, because it must be possible to have
# multiple faceted searches which don't share a config.
module.exports = Config
