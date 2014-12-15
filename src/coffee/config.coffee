Backbone = require 'backbone'

class Config extends Backbone.Model
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

    # The facetTitleMap is used for giving user friendly names to facets. Sometimes the database has
    # an unwanted name or no name, so the user is given the option to pass their own.
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

# Config is not a singleton, because it must be possible to have
# multiple faceted searches which don't share a config.
module.exports = Config
