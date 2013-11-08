fs = require 'fs'
path = require 'path'

module.exports = (connect, options) ->
	[
		(req, res, next) ->
			contentTypeMap =
				'.html': 'text/html'
				'.css': 'text/css'
				'.js': 'application/javascript'
				'.map': 'application/javascript' # js source maps
				'.gif': 'image/gif'
				'.jpg': 'image/jpeg'
				'.jpeg': 'image/jpeg'
				'.png': 'image/png'
				'.ico': 'image/x-icon'
			
			sendFile = (reqUrl) ->
				filePath = path.join options.base, reqUrl
				
				res.writeHead 200,
					'Content-Type': contentTypeMap[extName] || 'text/html'
					'Content-Length': fs.statSync(filePath).size

				readStream = fs.createReadStream filePath
				readStream.pipe res
			
			extName = path.extname req.url

			# If request is a file and it doesnt exist, pass req to connect
			if contentTypeMap[extName]? and not fs.existsSync(options.base + req.url)
				next()
			else if contentTypeMap[extName]?
				sendFile req.url
			else
				sendFile 'index.html'
	]
