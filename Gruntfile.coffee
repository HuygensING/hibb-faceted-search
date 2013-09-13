fs = require 'fs'
path = require 'path'

connect_middleware = (connect, options) ->
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

module.exports = (grunt) ->

	##############
	### CONFIG ###
	##############

	grunt.initConfig
		shell:
			'mocha-phantomjs': 
				command: 'mocha-phantomjs -R dot http://localhost:8000/.test/index.html'
				options:
					stdout: true
					stderr: true

			emptystage:
				command:
					'rm -rf stage/*'

			emptydev:
				command:
					'rm -rf dev/*'

			# rsync:
			# 	command:
			# 		'rsync --copy-links --compress --archive --verbose --checksum --exclude=.svn --chmod=a+r stage/ elaborate4@hi14hingtest.huygens.knaw.nl:elab4testFE/'
			# 	options:
			# 		stdout: true

			symlink_dev_images:
				command: [
					'cd dev'
					'ln -s ../images images'
				].join '&&'
			symlink_stage_images:
				command: [
					'cd stage'
					'ln -s ../images images'
				].join '&&'

			bowerinstall:
				command: 'bower install'
				options:
					stdout: true
					stderr: true

		connect:
			keepalive:
				options:
					port: 3000
					base: '/home/gijs/Projects/module-env/dev'
					middleware: connect_middleware
					keepalive: true
			dev:
				options:
					port: 3000
					base: '/home/gijs/Projects/module-env/dev'
					middleware: connect_middleware

		coffee:
			init:
				files: [
					expand: true
					cwd: 'src/coffee'
					src: '**/*.coffee'
					dest: 'dev/js'
					rename: (dest, src) -> 
						dest + '/' + src.replace(/.coffee/, '.js') # Use rename to preserve multiple dots in filenames (nav.user.coffee => nav.user.js)
				,
					'.test/tests.js': ['.test/head.coffee', 'test/**/*.coffee']
				]
			test:
				options:
					bare: true
					join: true
				files: 
					'.test/tests.js': ['.test/head.coffee', 'test/**/*.coffee']
			compile:
				options:
					bare: false # UglyHack: set a property to its default value to be able to call coffee:compile

		jade:
			init:
				files: [
					expand: true
					cwd: 'src/jade'
					src: '**/*.jade'
					dest: 'dev/html'
					rename: (dest, src) -> 
						dest + '/' + src.replace(/.jade/, '.html') # Use rename to preserve multiple dots in filenames (nav.user.coffee => nav.user.js)
				,
					'dev/index.html': 'src/index.jade'
				]
			compile:
				options:
					pretty: true

		stylus:
			compile:
				options:
					paths: ['src/stylus/import']
					import: ['variables', 'functions']
				files:
					'dev/css/main.css': [
						'src/stylus/**/*.styl'
						'!src/stylus/import/*.styl'
					]
		
		# concat:
		# 	css:
		# 		src: [
		# 			'dev/lib/normalize-css/normalize.css'
		# 			'dev/css/project.css'
		# 			'dev/lib/faceted-search/dev/css/main.css'
		# 		]
		# 		dest:
		# 			'dev/css/main.css'

		cssmin:
			stage:
				files:
					'stage/css/main.css': 'dev/css/main.css'

		# replace:
		# 	html:
		# 		src: 'dev/index.html'
		# 		dest: 'stage/index.html'
		# 		replacements: [
		# 			from: '<script data-main="/js/main" src="/lib/requirejs/require.js"></script>'
		# 			to: '<script src="/js/main.js"></script>'
		# 		]

		requirejs:
			compile:
				options:
					baseUrl: "dev/js"
					name: '../lib/almond/almond'
					include: 'main'
					exclude: ['backbone', 'jquery', 'underscore', 'text']
					preserveLicenseComments: false
					out: "stage/js/main.js"
					# optimize: 'none'
					paths:
						'jquery': '../lib/jquery/jquery.min'
						'underscore': '../lib/underscore-amd/underscore'
						'backbone': '../lib/backbone-amd/backbone'
						'text': '../lib/requirejs-text/text'
						'managers': '../lib/managers/dev'
						'helpers': '../lib/helpers/dev'
						'html': '../html'
					wrap:
						startFile: 'wrap.start.js'
						endFile: 'wrap.end.js'

		watch:
			options:
				livereload: true
				nospawn: true
			coffeetest:
				files: 'test/**/*.coffee'
				tasks: ['coffee:test', 'shell:mocha-phantomjs']
			coffee:
				files: ['src/coffee/**/*.coffee', '/home/gijs/Projects/module-env/src/coffee/**/*.coffee']
				tasks: ['coffee:compile', 'build']
			jade:
				files: ['src/index.jade', 'src/jade/**/*.jade']
				tasks: ['jade:compile', 'build']
			stylus:
				files: ['src/stylus/**/*.styl']
				tasks: ['stylus:compile', 'build']



	#############
	### TASKS ###
	#############

	grunt.loadNpmTasks 'grunt-contrib-coffee'
	grunt.loadNpmTasks 'grunt-contrib-stylus'
	grunt.loadNpmTasks 'grunt-contrib-jade'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-requirejs'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-cssmin'
	grunt.loadNpmTasks 'grunt-contrib-concat'
	grunt.loadNpmTasks 'grunt-contrib-connect'
	grunt.loadNpmTasks 'grunt-shell'
	grunt.loadNpmTasks 'grunt-text-replace'

	grunt.registerTask('default', ['shell:mocha-phantomjs']);

	grunt.registerTask 'w', 'watch'

	# Compile src/ to dev/ (empty dir, install deps, compile coffee, jade, stylus)
	grunt.registerTask 'compile', [
		'shell:emptydev' # rm -rf dev/
		'shell:bowerinstall' # Get dependencies first, cuz css needs to be included (and maybe images?)
		'coffee:init'
		'jade:init'
		'stylus:compile'
		'shell:symlink_dev_images' # Symlink from images/ to dev/images
	]

	# Build dev/ to stage/ (empty dir, run r.js)
	grunt.registerTask 'build', [
		'shell:emptystage'
		'cssmin:stage'
		'shell:symlink_stage_images'
		'requirejs:compile' # Run r.js
	]

	grunt.registerTask 'server', [
		'connect:keepalive'
	]

	grunt.registerTask 'sw', [
		'connect:dev'
		'watch'
	]



	##############
	### EVENTS ###
	##############

	grunt.event.on 'watch', (action, srcPath) ->

		if srcPath.substr(0, 3) is 'src'
			type = 'coffee' if srcPath.substr(-7) is '.coffee'
			type = 'jade' if srcPath.substr(-5) is '.jade'

			if type is 'coffee'
				testDestPath = srcPath.replace 'src/coffee', 'test'
				destPath = 'dev'+srcPath.replace(new RegExp(type, 'g'), 'js').substr(3);

			if type is 'jade'
				# if srcPath.substr(0, 18) is 'src/coffee/modules' # If the .jade comes from a module
				# 	a = srcPath.split('/')
				# 	a[0] = 'dev'
				# 	a[1] = 'html'
				# 	a.splice(4, 1)
				# 	destPath = a.join('/')
				# 	destPath = destPath.slice(0, -4) + 'html'
				# else # If the .jade comes from the main app
				destPath = 'dev'+srcPath.replace(new RegExp(type, 'g'), 'html').substr(3);

			if type? and action is 'changed' or action is 'added'
				data = {}
				data[destPath] = srcPath

				grunt.config [type, 'compile', 'files'], data
				grunt.file.copy '.test/template.coffee', testDestPath if testDestPath? and not grunt.file.exists(testDestPath)

			if type? and action is 'deleted'
				grunt.file.delete destPath
				grunt.file.delete testDestPath

		if srcPath.substr(0, 4) is 'test' and action is 'added'
			return false