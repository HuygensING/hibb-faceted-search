gulp = require 'gulp'
gutil = require 'gulp-util'
connect = require 'gulp-connect'
concat = require 'gulp-concat'
clean = require 'gulp-clean'
stylus = require 'gulp-stylus'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'

paths =
	coffee: './src/**/*.coffee'
	jade: './src/jade/**/*.jade'
	stylus: ['./src/**/*.styl', '!./src/stylus/import/*.styl']

gulp.task 'coffee', ->
	gulp.src('./src/coffee/main.coffee', read: false)
		.pipe(browserify(
			transform: ['coffeeify', 'jadeify']
			extensions: ['.coffee', '.jade']
			ignore: ['jquery', 'backbone', 'underscore']
			standalone: 'faceted-search'
		))
		.pipe(rename('faceted-search.js'))
		.pipe(gulp.dest(__dirname))

# gulp.task 'coffee', ->
# 	gulp.src('./src/coffee/main.coffee', read: false)
# 		.pipe(browserify(
# 			transform: ['coffeeify', 'jadeify']
# 			extensions: ['.coffee', '.jade']
# 			external: ['jquery', 'backbone', 'underscore']
# 			# standalone: 'faceted-search'
# 		))
# 		.pipe(rename('faceted-search.js'))
# 		.pipe(gulp.dest(__dirname))

gulp.task 'stylus', ->
	gulp.src(paths.stylus)
		.pipe(stylus(
			use: ['nib']
			import: ['./import/*.styl']
		))
		.pipe(concat('faceted-search.css'))
		.pipe(gulp.dest(__dirname))

gulp.task 'b', ['coffee', 'stylus']

gulp.task 'watch', ->
	gulp.watch [paths.jade], ['coffee']
	gulp.watch [paths.coffee], ['coffee']
	gulp.watch [paths.stylus], ['stylus']

gulp.task 'default', ['watch']