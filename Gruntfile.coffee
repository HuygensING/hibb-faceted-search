connect_middleware = require './middleware.connect'

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

			emptycompiled:
				command:
					'rm -rf compiled/*'

			# rsync:
			# 	command:
			# 		'rsync --copy-links --compress --archive --verbose --checksum --exclude=.svn --chmod=a+r stage/ elaborate4@hi14hingtest.huygens.knaw.nl:elab4testFE/'
			# 	options:
			# 		stdout: true

			symlink_compiled_images:
				command: [
					'cd compiled'
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
			compiled:
				options:
					port: 3000
					base: '/home/gijs/Projects/module-env/dev'
					middleware: connect_middleware
					open: true

		coffee:
			init:
				files: [
					expand: true
					cwd: 'src/coffee'
					src: '**/*.coffee'
					dest: 'compiled/js'
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

		# jade:
		# 	init:
		# 		files: [
		# 			expand: true
		# 			cwd: 'src/jade'
		# 			src: '**/*.jade'
		# 			dest: 'compiled/html'
		# 			rename: (dest, src) -> 
		# 				dest + '/' + src.replace(/.jade/, '.html') # Use rename to preserve multiple dots in filenames (nav.user.coffee => nav.user.js)
		# 		,
		# 			'compiled/index.html': 'src/index.jade'
		# 		]
		# 	compile:
		# 		options:
		# 			pretty: true


		jade:
			compile:
				files: 'compiled/templates.js': 'src/jade/**/*.jade'
				options:
					compileDebug: false
					client: true
					amd: true
					processName: (filename) ->
						parts = filename.split('/')
						parts.shift() # Remove first element of the array
						parts[0] = 'faceted-search' # Second element is now in first (0) position
						parts[parts.length-1] = parts[parts.length-1].replace('.jade', '')
						parts.join('/')

		stylus:
			compile:
				options:
					paths: ['src/stylus/import']
					import: ['variables', 'functions']
				files:
					'compiled/css/main.css': [
						'src/stylus/**/*.styl'
						'!src/stylus/import/*.styl'
					]
		
		# concat:
		# 	css:
		# 		src: [
		# 			'compiled/lib/normalize-css/normalize.css'
		# 			'compiled/css/project.css'
		# 			'compiled/lib/faceted-search/compiled/css/main.css'
		# 		]
		# 		dest:
		# 			'compiled/css/main.css'

		cssmin:
			stage:
				files:
					'stage/css/main.css': 'compiled/css/main.css'

		# replace:
		# 	html:
		# 		src: 'compiled/index.html'
		# 		dest: 'stage/index.html'
		# 		replacements: [
		# 			from: '<script data-main="/js/main" src="/lib/requirejs/require.js"></script>'
		# 			to: '<script src="/js/main.js"></script>'
		# 		]

		requirejs:
			compile:
				options:
					baseUrl: "compiled/js"
					name: '../lib/almond/almond'
					include: 'main'
					exclude: ['backbone', 'jquery', 'underscore'] # Exclude hilib?
					preserveLicenseComments: false
					out: "stage/js/main.js"
					# optimize: 'none'
					paths:
						'jquery': '../lib/jquery/jquery.min'
						'underscore': '../lib/underscore-amd/underscore'
						'backbone': '../lib/backbone-amd/backbone'
						# 'text': '../lib/requirejs-text/text'
						'hilib': '../lib/hilib/compiled'
						'tpls': '../templates'
						'jade': '../lib/jade/runtime'
						# 'html': '../html'
					wrap:
						startFile: 'wrap.start.js'
						endFile: 'wrap.end.js'

		watch:
			options:
				# livereload: true
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

	# Compile src/ to compiled/ (empty dir, install deps, compile coffee, jade, stylus)
	grunt.registerTask 'c', 'compile'
	grunt.registerTask 'compile', [
		'shell:emptycompiled' # rm -rf compiled/
		'shell:bowerinstall' # Get dependencies first, cuz css needs to be included (and maybe images?)
		'coffee:init'
		'jade:compile'
		'stylus:compile'
		'shell:symlink_compiled_images' # Symlink from images/ to compiled/images
	]

	# Build compiled/ to stage/ (empty dir, run r.js)
	grunt.registerTask 'b', 'build'
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
		'connect:compiled'
		'watch'
	]



	##############
	### EVENTS ###
	##############

	grunt.event.on 'watch', (action, srcPath) ->

		if srcPath.substr(0, 3) is 'src'
			type = 'coffee' if srcPath.substr(-7) is '.coffee'

			if type is 'coffee'
				testDestPath = srcPath.replace 'src/coffee', 'test'
				destPath = 'compiled'+srcPath.replace(new RegExp(type, 'g'), 'js').substr(3);

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
