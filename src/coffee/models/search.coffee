Backbone = require 'backbone'
_ = require 'underscore'

escapeTerm = (term) ->
	# Important to keep the slash first, to prevent re-escaping
	special = '\\ + - & | ! ( ) { } [ ] ^ " ~ * ? :'.split /\s+/
	escaped = term

	for char in special when char
		regex = '\\' + char
		console.log "Replacing #{char}", ///#{regex}///g
		# This seems superfluous, but it isn't.
		escaped = escaped.replace ///#{regex}///g, '\\' + char
	
	console.log escaped

	escaped

class Search extends Backbone.Model

	# queryData will be an array of dictionaries,
	# one for each full text search field
	#
	# Example:
	# "fullTextSearchParameters": [
  #     {
  #         "name": "dynamic_t_name",
  #         "term": "Reigersberch" 
  #     }
  # ]
	defaults: ->
		{}

	queryData: ->
		attrs = _.extend {}, @attributes

		data = for key, value of attrs
			name: key
			term: "*#{escapeTerm value}*"

		return fullTextSearchParameters: data

module.exports = Search