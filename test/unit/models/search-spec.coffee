define ["coffee/models/search", "chai"], (Search, chai) ->
	describe "Search", ->
		describe 'defaults', ->
			search = new Search
			it "term is *", ->
				search.get('term').should.equal '*'
			it 'caseSensitive is false', ->
				search.get('caseSensitive').should.equal false
			it 'fuzzy is false', ->
				search.get('fuzzy').should.equal false
			it 'title is "Text Search"', ->
				search.get('title').should.equal 'Text Search'
			it 'name is text_search', ->
				search.get('name').should.equal 'text_search'

		describe 'method queryData', ->
			it "excludes name and title", ->
				search = new Search
				data = search.queryData()

				should.not.exist data.name
				should.not.exist data.title