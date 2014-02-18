gulp = require 'gulp'
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'
		
gulp.task 'stylus', ->
	gulp.src(['./src/**/*.styl'])
		.pipe(stylus())
		.pipe(concat('main.css'))
		.pipe(gulp.dest(__dirname))

gulp.task 'watch', ->
	gulp.watch [paths.stylus], ['stylus']

gulp.task 'default', ['watch']