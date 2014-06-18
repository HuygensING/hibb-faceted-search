module.exports = {
  "Initial results" : function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 1000)
      .assert.containsText('section.fs-results h2', 'Remdoc: 6102')
      .assert.containsText('section.fs-results li:first-child', 'remdoc_14098')
      .assert.containsText('.facets .facet:first-child ul li:first-child', 'publications (all)')
      .assert.containsText('.facets .facet.range .slider label.min', '1424')
      .assert.containsText('.facets .facet.range .slider label.max', '2013')
      .end();
  }
};