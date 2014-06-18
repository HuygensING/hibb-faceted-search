module.exports = {
  "Collapse facets": function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 1000)
      .click('li.collapse-expand')
      .pause(1000)
      .assert.hidden('.facets .facet:nth-child(1) .body')
      .assert.hidden('.facets .facet:nth-child(3) .body')
      .assert.hidden('.facets .facet:nth-child(5) .body')
      .assert.hidden('.facets .facet:nth-child(7) .body')
      .assert.hidden('.facets .facet:nth-child(9) .body')
      .click('li.collapse-expand')
      .pause(1000)
      .assert.visible('.facets .facet:nth-child(1) .body')
      .assert.visible('.facets .facet:nth-child(3) .body')
      .assert.visible('.facets .facet:nth-child(5) .body')
      .assert.visible('.facets .facet:nth-child(7) .body')
      .assert.visible('.facets .facet:nth-child(9) .body')
      .click('li.collapse-expand')
      .pause(1000)
      .assert.hidden('.facets .facet:nth-child(1) .body')
      .assert.hidden('.facets .facet:nth-child(3) .body')
      .assert.hidden('.facets .facet:nth-child(5) .body')
      .assert.hidden('.facets .facet:nth-child(7) .body')
      .assert.hidden('.facets .facet:nth-child(9) .body')
      .click('li.collapse-expand')
      .pause(1000)
      .assert.visible('.facets .facet:nth-child(1) .body')
      .assert.visible('.facets .facet:nth-child(3) .body')
      .assert.visible('.facets .facet:nth-child(5) .body')
      .assert.visible('.facets .facet:nth-child(7) .body')
      .assert.visible('.facets .facet:nth-child(9) .body')
      .end();
  }
}