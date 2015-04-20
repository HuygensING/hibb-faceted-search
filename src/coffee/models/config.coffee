Backbone = require 'backbone'
_ = require 'underscore'

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
	# @param {Object} [facetDisplayNames={}] Map of facet names, mapping to facet titles. Use this map to give user friendly display names to facets in case the server doesn't give them.
	# @param {Array<String>} [facetOrder=[]] Define the rendering order of the facets. If undefined, the facets are rendered in the order returned by the backend.
	# @param {Object} [parsers={}] Hash of parser functions. Takes the options from the result and parses the options before rendering. Use sparsely, because with large option lists, the perfomance penalty can become great.
	# @param {Boolean} [collapsed=false] collapsed Start the faceted search with the facets collapsed.
	#
	# RESULTS OPTIONS
	# @param {Boolean} [results=false] Render the results. When kept to false, the showing of the results has to be taken care of in the application.
	# @param {Boolean} [sortLevels=true] Render sort levels in the results header
	# @param {Boolean} [showMetadata=true] Render show metadata toggle in the results header
	# @param {Boolean} [showPageNames] Show `page 1 of 23 pages` instead of `1 of 23`.
	#
	# OTHER RENDERING OPTIONS
	# @param {Object} [templates={}] Hash of templates. The templates should be functions which take a hash as argument to render vars. Possible keys: main, facets, text-search, facets.main, list.menu, list.body, range.body and result.
	# @param {Object} [templateData={}] Hash of template data. The same property names as with templates can be used. The data is passed to the corresponding template.
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
		queryOptions:
			facetValues: []
		requestOptions: {}
		entryMetadataFields: []
		levelDisplayNames: {}
		levels: []
		initLevels: {}

		### FACETS OPTIONS ###
		textSearch: 'advanced'
		textSearchOptions:
			caseSensitive: false
			fuzzy: false
		autoSearch: true
		# Rename to facetTitles
		facetDisplayNames: {}
		facetOrder: []
		parsers: {}
		collapse: false

		### RESULTS OPTIONS ###
		results: false
		sortLevels: true
		showMetadata: true
		showPageNames: null
		
		### OTHER RENDERING OPTIONS ###
		templates: {}
		templateData: {}
		labels:
			fullTextSearchFields: "Search in"
			numFound: "Found"
			filterOptions: "Filter options"
			sortAlphabetically: "Sort alphabetically"
			sortNumerically: "Sort numerically"
		termSingular: 'entry'
		termPlural: 'entries'

	###
	# Communication with the server relies on the facets field name. But the UI
	# has to show the displayName. There are three ways to retrieve the displayName.
	# First: get from the levelDisplayNames
	# Second: get from the facetDisplayNames
	# Third: get from the facetData returned in the first responseModel
	#
	# @method
	# @param {Object} responseModel
	###
	handleFirstResponseModel: (responseModel) ->
		# Clone textSearchOptions to force Backbone's change event to fire.
		textSearchOptions = _.clone(@get('textSearchOptions'))
		
		if responseModel.has 'fullTextSearchFields'
			textSearchOptions.fullTextSearchParameters = responseModel.get('fullTextSearchFields')
		else
			textSearchOptions.term = ""
			
			if @has('textLayers')
				textSearchOptions.textLayers = @get('textLayers')

		@set textSearchOptions: textSearchOptions

		if Object.keys(@get('levelDisplayNames')).length > 0
			initLevelMap = @_createDisplayNameMapFromMap 'levels', @get('levelDisplayNames')
			levelMap = @_createLevelMapFromMap responseModel.get('sortableFields'), @get('levelDisplayNames')
		else if Object.keys(@get('facetDisplayNames')).length > 0
			initLevelMap = @_createDisplayNameMapFromMap 'levels', @get('facetDisplayNames')
			levelMap = @_createLevelMapFromMap responseModel.get('sortableFields'), @get('facetDisplayNames')
		else
			initLevelMap = @_createDisplayNameMapFromFacetData 'levels', responseModel.get('facets')
			levelMap = @_createLevelMapFromFacetData responseModel.get('sortableFields'), responseModel.get('facets')

		if Object.keys(@get('facetDisplayNames')).length > 0
			fieldMap = @_createDisplayNameMapFromMap 'entryMetadataFields', @get('facetDisplayNames')
		else
			fieldMap = @_createDisplayNameMapFromFacetData 'entryMetadataFields', responseModel.get('facets')

		@set entryMetadataFields: fieldMap
		@set levels: levelMap
		@set initLevels: initLevelMap

	###
	# @method
	###
	_createLevelMapFromMap: (sortableFields, map) ->
		levelMap = {}
		
		for field in sortableFields
			if map.hasOwnProperty(field)
				levelMap[field] = map[field]
			else
				console.warn "Sortable field #{field} not found in map!"


		levelMap


	###
	#
	# @method
	# @param {String} prop
	# @param {Object} map
	###
	_createDisplayNameMapFromMap: (prop, map) ->
		newPropValues = {}
		oldPropValues = _.clone @get(prop)

		if oldPropValues.length > 0
			for value, j in oldPropValues
				if map.hasOwnProperty value
					newPropValues[value] = map[value]

		newPropValues

	###
	# @method
	###
	_createLevelMapFromFacetData: (sortableFields, facetsData) ->
		levelMap = {}
		
		for field in sortableFields
			for facetData in facetsData
				if facetData.name is field
					levelMap[field] = facetData.title

		levelMap

	###
	#
	# @method
	# @param {String} prop
	# @param {Object} facetsData
	# @return {Object}
	###
	_createDisplayNameMapFromFacetData: (prop, facetsData) ->
		newPropValues = {}
		oldPropValues = _.clone @get(prop)

		if oldPropValues.length > 0
			for facetData, i in facetsData
				for value, j in oldPropValues
					if facetData.name is value
						newPropValues[value] = facetData.title

		newPropValues

# Config is not a singleton, because it must be possible to have
# multiple faceted searches which don't share a config.
module.exports = Config
