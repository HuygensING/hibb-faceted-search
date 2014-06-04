gulp = require 'gulp'
gutil = require 'gulp-util'
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'
browserify = require 'browserify'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
streamify = require 'gulp-streamify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
pkg = require './package.json'

gulp.task 'stylus', ->
  gulp.src(['./src/**/*.styl'])
    .pipe(stylus())
    .pipe(concat('main.css'))
    .pipe(gulp.dest(__dirname))

gulp.task 'watch', ->
  gulp.watch [paths.stylus], ['stylus']

gulp.task 'default', ['watch']

bundle = (bundler, opts={}) ->


createBundle = (watch=false) ->
  args =
    entries: './src/coffee/main.coffee'
    extensions: ['.coffee', '.jade']

  if watch
    bundler = watchify args
    bundler.on 'update', bundle
  else
    bundler = browserify args

  bundler.external 'jquery'
  bundler.external 'backbone'
  bundler.external 'underscore'

  bundle = ->
    gutil.log('Browserify: bundling')
    bundler.bundle(standalone: 'FacetedSearch')
      .pipe(source("src.js"))
      .pipe(gulp.dest("./dist/#{pkg.version}"))
      .pipe(streamify(uglify()))
      .pipe(rename(extname: '.min.js'))
      .pipe(gulp.dest("./dist/#{pkg.version}"))

  bundle()

gulp.task 'browserify-src', -> createBundle false
#gulp.task 'watchify', -> createBundle true

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
    .pipe(gulp.dest("./dist/#{pkg.version}"))
    .pipe(streamify(uglify()))
    .pipe(rename(extname: '.min.js'))
    .pipe(gulp.dest("./dist/#{pkg.version}"))

gulp.task 'browserify', ['browserify-src', 'browserify-libs'], ->
  src = ["./dist/#{pkg.version}/libs.js", "./dist/#{pkg.version}/src.js"]

  gulp.src(src)
  .pipe(concat("main.js"))
  .pipe(gulp.dest("./dist/#{pkg.version}"))
  .pipe(streamify(uglify()))
  .pipe(rename(extname: '.min.js'))
  .pipe(gulp.dest("./dist/#{pkg.version}"))

gulp.task 'clean-latest', -> gulp.src('./dist/latest', read: false).pipe(clean())

gulp.task 'build', ['browserify', 'clean-latest'], ->
  gulp.src("dist/#{pkg.version}/**/*")
    .pipe(gulp.dest("./dist/latest"))

