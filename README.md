# Faceted Search
Backbone based library

### Changelog
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
