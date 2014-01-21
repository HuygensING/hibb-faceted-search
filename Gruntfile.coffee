connect_middleware = require 'my-grunt-modules/connect-middleware'

module.exports = (grunt) ->
	require('load-grunt-tasks') grunt
	require('my-grunt-modules/create-symlinks') grunt

	##############
	### CONFIG ###
	##############

	grunt.initConfig
		shell:
			options:
				stdout: true
				stderr: true
			mocha: 
				command: 'mocha-phantomjs -R dot http://localhost:8000/.test/index.html'
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
			bowerinstall:
				command: 'bower install'

		createSymlinks:
			compiled: [
				src: 'images'
				dest: 'compiled/images'
			,
				src: '~/Projects/hilib'
				dest: 'compiled/lib/hilib'
			]
			stage: [{
				src: 'images'
				dest: 'stage/images'
			}]

		connect:
			keepalive:
				options:
					port: 3000
					base: '/home/gijs/Projects/module-env/compiled'
					middleware: connect_middleware
					keepalive: true
			compiled:
				options:
					port: 3000
					base: '/home/gijs/Projects/module-env/compiled'
					middleware: connect_middleware
					# open: true

		coffee:
			compile:
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

		cssmin:
			stage:
				files:
					'stage/css/main.css': 'compiled/css/main.css'

		### OTHER ###

		touch:
			build: 'build'

		concurrent:
			compile: ['coffee:compile', 'jade', 'stylus']

		requirejs:
			compile:
				options:
					baseUrl: "compiled/js"
					name: '../lib/almond/almond'
					include: 'main'
					exclude: ['backbone', 'jquery', 'underscore'] # Exclude hilib?
					preserveLicenseComments: false
					out: "stage/js/main.js"
					optimize: 'none'
					paths:
						'jquery': '../lib/jquery/jquery.min'
						'underscore': '../lib/underscore-amd/underscore'
						'backbone': '../lib/backbone-amd/backbone'
						'hilib': '../lib/hilib/compiled'
						'tpls': '../templates'
						'jade': '../lib/jade/runtime'
					wrap:
						startFile: 'wrap.start.js'
						endFile: 'wrap.end.js'

		watch:
			options:
				# livereload: true
				nospawn: true
			coffeetest:
				files: 'test/**/*.coffee'
				tasks: ['coffee:test', 'shell:mocha']
			coffee:
				files: ['src/coffee/**/*.coffee', '/home/gijs/Projects/module-env/src/coffee/**/*.coffee']
				tasks: ['newer:coffee:compile', 'build']
			jade:
				files: ['src/index.jade', 'src/jade/**/*.jade']
				tasks: ['newer:jade', 'build']
			stylus:
				files: ['src/stylus/**/*.styl']
				tasks: ['newer:stylus', 'build']



	#############
	### TASKS ###
	#############

	grunt.registerTask('default', ['shell:mocha']);

	grunt.registerTask 'compile', [
		'shell:emptycompiled' # rm -rf compiled/
		'shell:bowerinstall' # Get dependencies first, cuz css needs to be included (and maybe images?)
		'concurrent:compile'
		'createSymlinks:compiled'
	]
	grunt.registerTask 'c', 'compile'

	grunt.registerTask 'build', [
		'shell:emptystage'
		'cssmin:stage'
		'createSymlinks:stage'
		'requirejs:compile'
		'touch:build'
	]
	grunt.registerTask 'b', 'build'

	grunt.registerTask 'server', [
		'connect:keepalive'
	]

	grunt.registerTask 'w', 'watch'
	
	grunt.registerTask 'sw', [
		'connect:compiled'
		'watch'
	]