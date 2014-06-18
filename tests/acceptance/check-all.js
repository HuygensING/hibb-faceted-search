module.exports = {
  "Check all options in list" : function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 10000)
      .click('.facets .list:nth-child(5) i.filter')
      .waitForElementVisible('.facets .list:nth-child(5) .options', 1000)

      // With more than 10 results, checking all checkboxes should not be possible.
      .assert.hidden('.facets .list:nth-child(5) .options input[name="all"]')

      .assert.containsText('.facets .list:nth-child(5) .options small.optioncount', '31 of 31')
      .setValue('.facets .list:nth-child(5) .options input[name="filter"]', 'l')
      .assert.containsText('.facets .list:nth-child(5) .options small.optioncount', '8 of 31')

      // With less than 10 results, checking all checkboxes should be possible.
      .assert.visible('.facets .list:nth-child(5) .options input[name="all"]')

      // Default state: all unchecked
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.checked', 'hidden')

      // Check all checkboxes
      .click('.facets .list:nth-child(5) .options input[name="all"]')
      .pause(500)
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.unchecked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.checked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.checked', 'visible')

      // Uncheck all checkboxes
      .click('.facets .list:nth-child(5) .options input[name="all"]')
      .pause(500)
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.unchecked', 'visible')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(1) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(2) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(3) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(4) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(5) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(6) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(7) i.checked', 'hidden')
      .assert.cssClassPresent('.facets .list:nth-child(5) .body ul li:nth-child(8) i.checked', 'hidden')
      .end();
  }
};