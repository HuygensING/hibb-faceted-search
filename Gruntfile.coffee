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
			emptydir:
				command:
					'rm -rf stage/*'
			# rsync:
			# 	command:
			# 		'rsync --copy-links --compress --archive --verbose --checksum --chmod=a+r elaborate4@hi14hingtest.huygens.knaw.nl:UNKNOWN'
			# 	options:
			# 		stdout: true
			symlink_images:
				command: [
					'cd stage'
					'ln -s ../dev/images images'
				].join '&&'

		coffee:
			init:
				files: [
					expand: true
					cwd: 'src/coffee'
					src: '**/*.coffee'
					dest: 'dev/js'
					ext: '.js'
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
					ext: '.html'			
				,
				# 	expand: true
				# 	cwd: 'src/coffee/modules'
				# 	src: '**/*.jade'
				# 	dest: 'dev/html/modules'
				# 	ext: '.html'
				# 	rename: (dest, src) ->
				# 		a = src.split('/') # src = moduleName/jade/tpl.jade
				# 		a.splice(1, 1) # Remove jade folder
				# 		dest + '/' + a.join('/') # Concat dest = 'dev/html/modules' with 'moduleName/tpl.jade'
				# ,
					# 'dev/index.html': 'src/index.jade'
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
					'dev/css/main.css': ['src/stylus/**/*.styl', '!src/stylus/import/*.styl']

		copy:
			css:
				files: [
					'stage/css/main.css': 'dev/css/main.css'
				]
			# module_images:
			# 	files: [
			# 		expand: true
			# 		cwd: 'src/coffee/modules/'
			# 		src: ['**/*.gif', '**/*.png', '**/*.jpg']
			# 		dest: 'dev/images/'
			# 	]

		# replace:
		# 	html:
		# 		src: 'dev/index.html'
		# 		dest: 'stage/index.html'
		# 		replacements: [
		# 			from: '<script data-main="/js/main" src="/lib/requirejs/require.js"></script>'
		# 			to: '<script src="/js/require.js"></script><script src="/js/main.js"></script>'
		# 		]

		requirejs:
			compile:
				options:
					name: 'views/faceted-search'
					baseUrl: "dev/js"
					preserveLicenseComments: false
					out: "stage/js/faceted-search.js"
					paths:
						'backbone': '../lib/backbone-amd/backbone-min'
						'domready': '../lib/requirejs-domready/domReady'
						'jquery': '../lib/jquery/jquery.min'
						'text': '../lib/requirejs-text/text'
						'underscore': '../lib/underscore-amd/underscore-min'
						'html': '../html'

		uglify:
			requirejs:
				files:
					'stage/js/require.js': 'dev/lib/requirejs/require.js'

		watch:
			options:
				livereload: true
				nospawn: true
			coffeetest:
				files: 'test/**/*.coffee'
				tasks: ['coffee:test', 'shell:mocha-phantomjs']
			coffee:
				files: 'src/coffee/**/*.coffee'
				tasks: 'coffee:compile'
			jade:
				files: ['src/index.jade', 'src/jade/**/*.jade']
				tasks: 'jade:compile'
			stylus:
				files: ['src/stylus/**/*.styl']
				tasks: 'stylus:compile'

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
	grunt.loadNpmTasks 'grunt-shell'
	grunt.loadNpmTasks 'grunt-text-replace'

	grunt.registerTask('default', ['shell:mocha-phantomjs']);

	grunt.registerTask('init', ['coffee:init', 'jade:init', 'stylus:compile']);

	grunt.registerTask 'build', [
		'shell:emptydir'
		# 'replace:html' # Copy and replace index.html
		'copy:css' # Copy main.css
		# 'copy:module_images'
		'uglify:requirejs' # Minify and copy require.js
		'shell:symlink_images'
		'requirejs:compile' # Run r.js
		# 'shell:rsync' # Rsync to test server (without json/)
	]




	##############
	### EVENTS ###
	##############

	grunt.event.on 'watch', (action, srcPath) ->
		if srcPath.substr(0, 3) is 'src' # Make sure file comes from src/		
			type = 'coffee' if srcPath.substr(-7) is '.coffee'
			type = 'jade' if srcPath.substr(-5) is '.jade'

			if type is 'coffee'
				testDestPath = srcPath.replace 'src/coffee', 'test'
				destPath = 'dev'+srcPath.replace(new RegExp(type, 'g'), 'js').substr(3);

			if type is 'jade'
				if srcPath.substr(0, 18) is 'src/coffee/modules' # If the .jade comes from a module
					a = srcPath.split('/')
					a[0] = 'dev'
					a[1] = 'html'
					a.splice(4, 1)
					destPath = a.join('/')
					destPath = destPath.slice(0, -4) + 'html'
				else # If the .jade comes from the main app
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