module.exports = {
  "Switch type" : function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 1000)
      .click('ul.facets-menu li.switch button')gi
      .assert.hidden('.search-type-simple .facets')
      .assert.hidden('.search-type-simple .facets .facet.list')
      .assert.hidden('.search-type-simple .facets .facet.range')
      .click('ul.facets-menu li.switch button')
      .assert.visible('.search-type-advanced .facets')
      .assert.visible('.search-type-advanced .facets .facet.list')
      .assert.visible('.search-type-advanced .facets .facet.range')
      .end();
  }
};