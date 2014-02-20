
module.exports =
	# TODO: Merge baseUrl & searchPath into searchUrl, elaborate uses baseUrl + searchPath, publication collection uses
	# searchPath only. If elaborate uses baseUrl & searchPath, concat them by hand before sending to FS.
	baseUrl: ''
	searchPath: ''
	search: true
	token: null
	queryOptions: {}
	# TODO: Rename to facetTitleMap (name is for computer, title is for user, these 'names' are titles)
	facetNameMap: {}