# The facetViewMap is a mapping of all (internally) available facets (List, Boolean, Date, etc).
# The map can be extended by user defined facets, by passing a mapping in the options.

# The map cannot be a part of the config, because it would create a circular reference when
# the config is required by one of the views in the map.

module.exports =
	BOOLEAN: require './views/facets/boolean'
	DATE: require './views/facets/date'
	RANGE: require './views/facets/range'
	LIST: require './views/facets/list'