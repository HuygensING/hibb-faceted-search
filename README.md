# Faceted Search
Backbone based library

### Changelog

### v2.1.1
- Little refactoring and code clean up.

#### v2.1.0
- [feat] Add a view for the results

#### v2.0.10
- [perf] Move range logic from view to model.

#### v2.0.9
- [bug] sortResultsBy still worked using sort instead of sortParameters.

#### v2.0.8
- Don't remove active class from filter when toggling sorting.
- Add authorizationHeaderToken to config.
- If only one text layer is present don't show it as an option in the full text.
- Change reset logic in list facet, would not update correct.

#### v2.0.7
- Range facet labels (years) are now editable.
- Main and facets templates are now seperate templates (used to be one)

#### v2.0.6
- Trigger "request:failed" event when a request made from the FS fails

#### v2.0.5
- ListFacet reset would not reset the sorting strategy.
- ListFacet sorting is now split in two: count > 0 and count == 0.
  Count > 0 has precedence over count == 0.
  
#### v2.0.4
- Facets would not update if no results where returned by the server.

#### v2.0.3
- Remove switch type bug.
- Remove <form> to prevent auto form submit.
- Clean up mark up.

#### v2.0.2
- ListFacet would not reset properly.

#### v2.0.1
- Fix range resize bug.
- Fix passing wrong arguments to queryOptions.
- Add a standalone FS instance to be used for debugging and acceptance tests.
- Move facets models to facet/ dir.

#### v2.0.0
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
