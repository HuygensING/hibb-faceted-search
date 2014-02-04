define ['coffee/models/main', 'chai'], (FacetedSearch, chai) ->
	describe 'FacetedSearch', ->
		fs = null
		before ->
			fs = new FacetedSearch
