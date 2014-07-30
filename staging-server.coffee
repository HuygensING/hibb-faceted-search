express = require 'express'
bodyParser = require 'body-parser'
app = express()
app.use bodyParser()

responses = do ->
  init: require './stage/responses/init.json'
  'select-content-type': require './stage/responses/select-content-type.json'

app.post '/search', (req, res) ->
  resultId = 'init'
  reqBody = JSON.stringify(req.body)
  console.log reqBody
  if reqBody is '{"facetValues":[{"name":"content_type","values":["works of art","books/e-books"]}],"sortParameters":[]}'
    resultId = 'select-content-type'
  else if reqBody is '{"facetValues":[],"sortParameters":[],"term":"saskia","caseSensitive":false,"fuzzy":false}'
    resultId = 'term-saskia'
  else if reqBody is '{"facetValues":[{"name":"content_type","values":["works of art","books/e-books"]},{"name":"artist_name","values":["Gerard Hoet"]}],"sortParameters":[]}'
    resultId = 'content-type-and-author'
  else if reqBody is '{"facetValues":[],"sortParameters":[],"term":"blabla","caseSensitive":false,"fuzzy":false}'
    resultId = 'term-blabla'

  res.location 'http://localhost:3001/api/result/'+resultId
  res.status 201
  res.send 201

app.get '/result/:id', (req, res) ->
  try
    json = require "./stage/responses/#{req.params.id}.json"
  catch
    json = 404

  res.send json

app.listen 3000
console.log 'Staging server listening on 3000'