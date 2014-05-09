
module.exports =
	# TODO: Merge baseUrl & searchPath into searchUrl, elaborate uses baseUrl + searchPath, publication collection uses
	# searchPath only. If elaborate uses baseUrl & searchPath, concat them by hand before sending to FS.
	baseUrl: ''
	
	searchPath: ''

	# textSearch has three options: 'none', 'simple', 'advanced'
	# none: text search is hidden, facets are shown, loader is shown
	# simple: text search is shown, facets are hidden, loader is hidden
	# advanced: text search is shown, facets are shown, loader is shown
	textSearch: 'advanced'

	token: null

	queryOptions: {}
	# * resultRows

	# The facetNameMap is used for giving user friendly names to facets. Sometimes the database has
	# an unwanted name or no name, so the user is given the option to pass their own.
	# TODO: Rename to facetTitleMap (name is for computer, title is for user, these 'names' are titles)
	facetNameMap: {}

	templates: {}

	# When set to true, a search is performed whenever the mainModel (queryOptions) change.
	autoSearch: true