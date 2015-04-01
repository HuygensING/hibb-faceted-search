# Faceted Search
Backbone based library

## Git commit messages

### Emoji's
- :zap: `:zap:` when introducing a breaking change
- :sparkles: `:sparkles:` when adding a feature
- :bug: `:bug:` when fixing a bug
- :flashlight: `:flashlight:` when improving debuggability
- :lipstick: `:lipstick:` when improving the format/structure of the code
- :racehorse: `:racehorse:` when improving performance
- :lock: `:lock:` when dealing with security
- :fire: `:fire:` when removing code or files
- :white_check_mark: `:white_check_mark:` when adding tests
- :memo: `:memo:` when writing docs
- :arrow_up: `:arrow_up:` when upgrading dependencies
- :arrow_down: `:arrow_down:` when downgrading dependencies

## Changelog

### DEV
- Rename repo to hibb-faceted-search (Huygens Ing BackBone)
- :sparkles: Let the range facet parse limits of length 0, 1, 2, 3 and 4 (was only 7 or 8)
- :sparkles: Let stylus inline images (base64 encoded)
- :bug: Don't extend queryOptions with textSearch options when textSearch: 'none'
- :lipstick: Replace fontawesome icons with svg icons
- :lipstick: Run through derequire (required for standalone module)
- :fire: Remove link and unlink tasks from Gulpfile
- :arrow_up: Upgrade browserify (9.0.3) and watchify (3.0.0)

### v2.4.0
- :sparkles: Option to collapse all facets on init
- :sparkles: Add a parser option to parse server data before rendering
- :sparkles: Trigger event when rendering of the results has finished
- :sparkles: Add template data to the config
- :bug: Fix editting range labels
- :bug: Parse list options on facet search reset
- :bug: Select max one text search field per search (for Timbuctoo).
- :lipstick: Remove dirty implementation of _searchValue and add clean version.
- :lipstick: Move config
- :fire: Remove date facet
- :memo: Add jsdocs (with crojsdoc)
- :arrow_up: Hibb-pagination to 1.2.0

### v2.3.1
- :bug: Change updating of sortable fields.

### v2.3.0
- :sparkles: ShowMetadata and sortLevels in the results <header> are now optional.
- :sparkles: Add facetOrder to config, to be able to rearrange facets returned by the server.
- :sparkles: Add a method to search for a single value. Programmatically mimic a user selecting one option of a facet.
- :sparkles: Double click to edit range limits.
- :sparkles: Add labels to config for easy renaming (support multiple languages)
- :bug: Rendering of TextSearch is split in init and render, so init data can be used in the queryOptions.
- :racehorse: More advanced caching of search results.

### v2.2.0

- :sparkles: Add isMetadataVisible prop to results view
- :sparkles: Add result-per-page option to results view
- :bug: Store result model on change page

### v2.1.1
- :lipstick: Little refactoring and code clean up.

### v2.1.0
- :sparkles: Add a view for the results

### v2.0.10
- :racehorse: Move range logic from view to model.

### v2.0.9
- :bug: sortResultsBy still worked using sort instead of sortParameters.

### v2.0.8
- Don't remove active class from filter when toggling sorting.
- Add authorizationHeaderToken to config.
- If only one text layer is present don't show it as an option in the full text.
- Change reset logic in list facet, would not update correct.

### v2.0.7
- Range facet labels (years) are now editable.
- Main and facets templates are now seperate templates (used to be one)

### v2.0.6
- Trigger "request:failed" event when a request made from the FS fails

### v2.0.5
- ListFacet reset would not reset the sorting strategy.
- ListFacet sorting is now split in two: count > 0 and count == 0.
  Count > 0 has precedence over count == 0.
  
### v2.0.4
- Facets would not update if no results where returned by the server.

### v2.0.3
- Remove switch type bug.
- Remove <form> to prevent auto form submit.
- Clean up mark up.

### v2.0.2
- ListFacet would not reset properly.

### v2.0.1
- Fix range resize bug.
- Fix passing wrong arguments to queryOptions.
- Add a standalone FS instance to be used for debugging and acceptance tests.
- Move facets models to facet/ dir.

### v2.0.0
- BREAKING: package is now available as a standalone browserify build through the /dist dir. 
  Javascript is now split in two: one file for libs (libs.js) and one for the faceted search (src.js).
  There is also a main.js which is libs.js and src.js concatenated.
- BREAKING: rename config.facetNameMap to config.facetTitleMap.
- BREAKING: faceted search will not start searching automatically after initialization. Call manually using fs.search().
- Replaced huygens/hilib with gijsjan/funcky-* mini libs. Funcky mini libs are (very) small sets of functions without 
  third party deps.
- The mainModel is now known as queryOptions.
- Firing requests is now a responsibility of the searchResults collection, instead of a searchResult model.
- ... general refactoring and cleaning up of code.
