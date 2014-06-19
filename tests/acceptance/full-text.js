// Test full text search. Trigger search by clicking search button and by
// pressing enter key. Between searches the reset key is used (and thus tested).

module.exports = {
  "Full text search": function (browser) {
    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 10000)
      .assert.containsText('section.fs-results h2', 'Remdoc: 6102')
      .setValue('input[name="search"]', 'saskia')
      .click('.search-input i.fa-search')
      .pause(500)
      .assert.containsText('section.fs-results h2', 'Remdoc: 130')
      .click('ul.facets-menu li.reset')
      .pause(500)
      .assert.containsText('section.fs-results h2', 'Remdoc: 6102')
      .setValue('input[name="search"]', 'saskia')
      .keys(['\uE007'], function() {
        this.pause(500).assert.containsText('section.fs-results h2', 'Remdoc: 130');
      })
      .end();
  }
}