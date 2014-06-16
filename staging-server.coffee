express = require 'express'
bodyParser = require 'body-parser'
app = express()
app.use bodyParser()

responses = do ->
  init: require './stage/responses/init.json'

app.post '/search', (req, res) ->
  res.location 'http://localhost:9001/api/result'
  res.status 201
  res.send 201

app.get '/result', (req, res) ->
  res.send responses.init

app.listen 3000
console.log 'Staging server listening on 3000'