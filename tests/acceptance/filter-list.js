module.exports = {
  "Filter list" : function (browser) {
    browser.countElements = function(value, count) {
      browser
        .clearValue('.facets .list .options input[name="filter"]')
        .setValue('.facets .list .options input[name="filter"]', value)
        .elements('css selector', '.facets .list:first-child .body ul li', function(response) {
          this.assert.equal(response.value.length, count)
        });

      return browser;
    };

    browser
      .url("http://localhost:9001/stage")
      .waitForElementVisible('section.fs-results ul.results li', 10000)
      .click('.facets .list i.filter')
      .waitForElementVisible('.facets .list .options', 1000)
      .countElements('', 10)
      .countElements('p', 4)
      .countElements('pa', 3)
      .countElements('pap', 1)
      .countElements('pa', 3)
      .countElements('p', 4)
      .keys(['\uE003'], function() {
        this.countElements('', 10)
      })
      .end();
  }
};