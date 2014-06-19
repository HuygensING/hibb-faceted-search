// Test if after pressing the reset button all facets and the text search are reset.

module.exports = {
  "Reset": function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 10000)
      .assert.containsText('section.fs-results h2', 'Remdoc: 6102')
      .click('li[data-value="works of art"]')
      .click('li[data-value="books/e-books"]')
      // Wait for fs to update results.
      .pause(1000)
      .click('li[data-value="Gerard Hoet"]')
      // Wait for fs to update results.
      .pause(1000)
      .elements('css selector', 'i.checked.visible', function(response) {
        this.assert.equal(response.value.length, 3);
      })
      .assert.containsText('section.fs-results h2', 'Remdoc: 57')
      .assert.containsText('label.min', '1676')
      .assert.containsText('label.max', '1752')
      .click('ul.facets-menu li.reset')
      .pause(1000)
      .elements('css selector', 'i.checked.visible', function(response) {
        this.assert.equal(response.value.length, 0)
      })
      .end();
  }
}