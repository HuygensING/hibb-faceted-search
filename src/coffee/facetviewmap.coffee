# The facetViewMap is a mapping of all (internally) available facets (List, Boolean, Date, etc).
# The map can be extended by user defined facets, by passing a mapping in the options.

module.exports =
	BOOLEAN: require './views/facets/boolean'
	DATE: require './views/facets/date'
	RANGE: require './views/facets/range'
	LIST: require './views/facets/list'