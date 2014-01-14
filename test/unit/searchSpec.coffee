define ["coffee/models/search", "jquery", "underscore"], (Search, $, _) ->
	describe "Search", ->
		describe 'defaults', ->
			search = new Search
			it "term is *", ->
				expect(search.get 'term').toBe '*'
			it 'caseSensitive is false', ->
				expect(search.get 'caseSensitive').toBe false
			it 'fuzzy is false', ->
				expect(search.get 'fuzzy').toBe false
			it 'title is "Text Search"', ->
				expect(search.get 'title').toBe 'Text Search'
			it 'name is text_search', ->
				expect(search.get 'name').toBe 'text_search'

		describe 'method queryData', ->
			it "excludes name and title", ->
				m = new Search
				qd = m.queryData()
				expect(qd.name).not.toBeDefined()
				expect(qd.title).not.toBeDefined()
