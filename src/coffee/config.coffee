Backbone = require 'backbone'

###
# @class
# @namespace Models
# @todo Move to ./models
###
class Config extends Backbone.Model
	###
	# Default attributes.
	#
	# Does not require any parameters, but the @param tag is (ab)used to document
	# the default values.
	#
	# @method
	#
	# REQUEST OPTIONS
	# @param {String} baseUrl Base of the URL to perform searches.
	# @param {String} searchPath Path of the URL to perform searches.
	# @param {Number} [resultRows=10] Number of results per query/page.
	# @param {String} [authorizationHeaderToken] If set, an Authorization header with given token will be send along with each request.
	# @param {Object} [queryOptions={}]
	# @param {Array<Object>} [queryOptions.facetValues=[]] Array of objects containing a facet name and values: {name: 'facet_s_writers', values: ['pietje', 'pukje']}
	# @param {Array<Object>} [queryOptions.sortParameters=[]] Array of objects containing fieldname and direction: {fieldname: 'language', direction: 'desc'}

	# @param {Array<String>} [queryOptions.resultFields] List of metadata fields to be returned by the server for every result.
	# @param {Object} [requestOptions={}] Send extra options to the POST query call, such as setting custom headers (e.g., VRE_ID for Timbuctoo).
	# @param {Array<String>} [entryMetadataFields=[]] A list of all the entries metadata fields. This list corresponds to the facets and is used to populate the sortLevels in the  result view.
	# @param {Array<String>} [levels=[]] An array of max three strings. Determine the three levels of sorting the results. The three levels are entry metadata fields and are also present in the entryMetadataFields array.
	#
	# FACETS OPTIONS
	# @param {String} [textSearch='advanced'] One of 'none', 'simple' or 'advanced'. None: text search is hidden, facets are shown, loader is shown. Simple: text search is shown, facets are hidden, loader is hidden. Advanced: text search is shown, facets are shown, loader is shown.
	# @param {Object} [textSearchOptions] Options that are passed to the text search component
	# @param {Boolean} [textSearchOptions.caseSensitive=false] Render caseSensitive option.
	# @param {Boolean} [textSearchOptions.fuzzy=false] Render fuzzy option.
	# @param {Array<Object>} [textSearchOptions.fullTextSearchParameters] Search in multiple full text fields. Objects passed have a name and term attribute.
	# @param {Boolean} [autoSearch=true] # When set to true, a search is performed whenever the mainModel (queryOptions) change.
	# @param {Object} [facetTitleMap={}] Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
	# @param {Array<String>} [facetOrder=[]] Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
	# @param {Object} [parsers={}] Hash of parser functions. Takes the options from the result and parses the options before rendering. Use sparsely, because with large option lists, the perfomance penalty can become great.
	#
	# RESULTS OPTIONS
	# @param {Boolean} [results=false] Render the results. When kept to false, the showing of the results has to be taken care of in the application.
	# @param {Boolean} [sortLevels=true] Render sort levels in the results header
	# @param {Boolean} [showMetadata=true] Render show metadata toggle in the results header
	#
	# OTHER RENDERING OPTIONS
	# @param {Object} [templates={}] Hash of templates. The templates should be functions which take a hash as argument to render vars. Possible keys: main, facets, text-search, facets.main, list.menu, list.body and range.body.
	# @param {Object} [labels={}] Hash of labels, used in the interface. Quick 'n dirty way to change the language.
	# @param {String} [termSingular="entry"] Name of one result, for example: book, woman, country, alumnus, etc.
	# @param {String} [termPlural="entries"] Name of multiple results, for example: books, women, countries, alunmi, etc.
	#
	# @return {Object} A hash of default attributes and their values. Documentated as @param's.
	###
	defaults: ->
		### REQUEST OPTIONS ###
		baseUrl: null
		searchPath: null
		resultRows: 10
		authorizationHeaderToken: null
		queryOptions: {}
		requestOptions: {}
		entryMetadataFields: []
		levels: []

		### FACETS OPTIONS ###
		textSearch: 'advanced'
		textSearchOptions:
			caseSensitive: false
			fuzzy: false
		autoSearch: true
		facetTitleMap: {}
		facetOrder: []
		parsers: {}

		### RESULTS OPTIONS ###
		results: false
		sortLevels: true
		showMetadata: true
		
		### OTHER RENDERING OPTIONS ###
		templates: {}
		labels:
			fullTextSearchFields: "Search in"
			numFound: "Found"
			filterOptions: "Filter options"
			sortAlphabetically: "Sort alphabetically"
			sortNumerically: "Sort numerically"
		termSingular: 'entry'
		termPlural: 'entries'

# Config is not a singleton, because it must be possible to have
# multiple faceted searches which don't share a config.
module.exports = Config
