fs = require 'fs'
path = require 'path'
gutil = require 'gulp-util'
http = require 'http'

module.exports = (connect, options) ->
  (req, res, next) ->
      contentTypeMap =
        '.html': 'text/html'
        '.css': 'text/css'
        '.js': 'application/javascript'
        '.map': 'application/javascript' # js source maps
        '.json': 'application/json'
        '.gif': 'image/gif'
        '.jpg': 'image/jpeg'
        '.jpeg': 'image/jpeg'
        '.png': 'image/png'
        '.ico': 'image/x-icon'
        '.svg': 'image/svg+xml'
        '.woff': 'application/font-woff'
        '.ttf': 'application/x-font-ttf'

      sendFile = (reqUrl) ->
        filePath = path.join options.root, reqUrl

        res.writeHead 200,
          'Content-Type': contentTypeMap[extName] || 'text/html'
          'Content-Length': fs.statSync(filePath).size

        readStream = fs.createReadStream filePath
        readStream.pipe res

      extName = path.extname req.url

      # Proxy /api to node server
      if req.url.substr(0,4) is '/api'
        opts =
          hostname: 'localhost'
          port: 3000
          path: req.url.substr(4)
          method: req.method

        dbReq = http.request opts, (dbRes) ->
          dbRes.setEncoding 'utf8'
          data = ''
          dbRes.on 'data', (chunk) ->
            # console.log 'Response' + chunk
            data += chunk
          dbRes.on 'end', ->
            # console.log data
#            res.setHeader 'Content-Type', 'application/json'
            res.statusCode = dbRes.statusCode
            for header, value of dbRes.headers
              res.setHeader header, value

            res.end data
#            console.log dbRes
#            res.end()


        if Object.keys(req.body).length > 0 and (req.method is 'POST' or req.method is 'PUT')
          dbReq.write JSON.stringify(req.body) if req.body?
        dbReq.end()

      # If request is a file and it doesnt exist, pass req to connect
      else if contentTypeMap[extName]? and not fs.existsSync(options.root + req.url)
        next()
      else if contentTypeMap[extName]?
        sendFile req.url
      else
        sendFile 'index.html'