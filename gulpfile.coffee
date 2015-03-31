gulp = require 'gulp'
gutil = require 'gulp-util'
stylus = require 'gulp-stylus'
connect = require 'gulp-connect'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
minifyCss = require 'gulp-minify-css'
uglify = require 'gulp-uglify'
streamify = require 'gulp-streamify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'

browserify = require 'browserify'
watchify = require 'watchify'
source = require 'vinyl-source-stream'
bodyParser = require 'body-parser'
browserSync = require 'browser-sync'
modRewrite = require 'connect-modrewrite'
proxy = require('proxy-middleware')
exec = require('child_process').exec
nib = require 'nib'
url = require('url')
async = require 'async'
rimraf = require 'rimraf'
extend = require 'extend'

derequire = require('gulp-derequire')

connectRewrite = require './connect-rewrite'
pkg = require './package.json'
cfg = require './config.json'

# cssFiles = [
# 	'./dist/main.css'
# 	'./node_modules/huygens-backbone-pagination/dist/main.css'
# ]

gulp.task 'link', (done) ->
	removeModules = (cb) ->
		modulePaths = cfg['local-modules'].map (module) -> "./node_modules/#{module}"
		async.each modulePaths , rimraf, (err) -> cb()

	linkModules = (cb) ->
		moduleCommands = cfg['local-modules'].map (module) -> "npm link #{module}"
		async.each moduleCommands, exec, (err) -> cb()

	async.series [removeModules, linkModules], (err) ->
		return gutil.log err if err?
		done()

gulp.task 'unlink', (done) ->
	unlinkModules = (cb) ->
		moduleCommands = cfg['local-modules'].map (module) -> "npm unlink #{module}"
		async.each moduleCommands, exec, (err) -> cb()

	installModules = (cb) ->
		exec 'npm i', cb

	async.series [unlinkModules, installModules], (err) ->
		return gutil.log err if err?
		done()

gulp.task 'server', ['concat-css', 'watch', 'watchify'], ->
	proxyOptions = url.parse('http://localhost:3000')
	proxyOptions.route = '/api'

	browserSync.init null,
		server:
			baseDir: './stage'
			middleware: [proxy(proxyOptions)]

gulp.task 'stylus', ->
	gulp.src('./src/stylus/main.styl')
		.pipe(stylus(
			use: [nib()]
			errors: true
		))
		.pipe(gulp.dest('./dist'))
		.pipe(minifyCss())
		.pipe(rename(extname:'.min.css'))
		.pipe(gulp.dest('./dist'))

gulp.task 'concat-css', ['stylus'], ->
	cssFiles = ['./dist/main.css']
	
	for cssFile in cfg['css-files']
		cssFiles.push cssFile
	
	gulp.src(cssFiles)
		.pipe(concat('main.css'))
		.pipe(gulp.dest('./dist'))
		.pipe(minifyCss())
		.pipe(rename(extname:'.min.css'))
		.pipe(gulp.dest('./dist'))

gulp.task 'prepare-coverage', ['coffee'], ->
	#  Copy .jade files to compiled so tests can find .jade files.
	gulp.src('./src/jade/**/*')
		.pipe(gulp.dest('./compiled/jade'))

# Used by jscoverage
gulp.task 'coffee', ->
	gulp.src('./src/coffee/**/*')
		.pipe(coffee())
		.pipe(gulp.dest('./compiled/coffee'))

gulp.task 'watch', ->
	gulp.watch ['./src/**/*.styl'], ['concat-css']
	gulp.watch cfg['css-files'], ['concat-css']
	gulp.watch ['./stage/index.html', './stage/*/*.css'], -> browserSync.reload()

gulp.task 'default', ['watch', 'watchify']

createBundle = (watch=false) ->
	args =
		entries: './src/coffee/main.coffee'
		extensions: ['.coffee', '.jade']

	args = extend args, watchify.args if watch

	bundle = ->
		gutil.log('Browserify: bundling')
		bundler.bundle(standalone: 'FacetedSearch')
			.on('error', ((err) -> gutil.log("Bundling error ::: "+err)))
			.pipe(source("src.js"))
			.pipe(derequire())
			.pipe(gulp.dest("./dist"))
			.pipe(streamify(uglify()))
			.pipe(rename(extname: '.min.js'))
			.pipe(gulp.dest("./dist"))
			.pipe(browserSync.reload(stream: true, once: true))

	bundler = browserify args
	if watch
		bundler = watchify(bundler)
		bundler.on 'update', bundle

	bundler.exclude 'jquery'
	bundler.exclude 'backbone'
	bundler.exclude 'underscore'

	bundler.transform 'coffeeify'
	bundler.transform 'jadeify'

	bundle()

gulp.task 'browserify-src', -> createBundle false
gulp.task 'watchify', -> createBundle true

gulp.task 'browserify-libs', ->
	libs =
		jquery: './node_modules/jquery/dist/jquery'
		backbone: './node_modules/backbone/backbone'
		underscore: './node_modules/underscore/underscore'

	paths = Object.keys(libs).map (key) -> libs[key]

	bundler = browserify paths

	for own id, path of libs
		bundler.require path, expose: id

	gutil.log('Browserify: bundling libs')
	bundler.bundle()
		.pipe(source("libs.js"))
		.pipe(gulp.dest("./dist"))
		.pipe(streamify(uglify()))
		.pipe(rename(extname: '.min.js'))
		.pipe(gulp.dest("./dist"))

gulp.task 'browserify', ['browserify-src', 'browserify-libs'], ->
	src = ["./dist/libs.js", "./dist/src.js"]

	gulp.src(src)
		.pipe(concat("main.js"))
		.pipe(gulp.dest("./dist"))
		.pipe(streamify(uglify()))
		.pipe(rename(extname: '.min.js'))
		.pipe(gulp.dest("./dist"))

#gulp.task 'clean-latest', -> gulp.src('./dist/latest', read: false).pipe(clean())

gulp.task 'build', ['browserify', 'concat-css']

gulp.task 'default', ['concat-css', 'watch', 'watchify']