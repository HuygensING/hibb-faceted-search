gulp = require 'gulp'
gutil = require 'gulp-util'
stylus = require 'gulp-stylus'
connect = require 'gulp-connect'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
minifyCss = require 'gulp-minify-css'
browserify = require 'browserify'
watchify = require 'watchify'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
streamify = require 'gulp-streamify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
bodyParser = require 'body-parser'
exec = require('child_process').exec
nib = require 'nib'

connectRewrite = require './connect-rewrite'
pkg = require './package.json'

gulp.task 'connect', ->
  connect.server
    root: './stage'
    port: 9001
    livereload: true
    middleware: (connect, options) -> [bodyParser(), connectRewrite(connect, options)]

gulp.task 'stylus', ->
  gulp.src(['./src/**/*.styl'])
    .pipe(stylus(
      use: [nib()]
      errors: true
    ))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(minifyCss())
    .pipe(rename(extname:'.min.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload())

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
  gulp.watch ['./src/**/*.styl'], ['stylus']
  gulp.watch ['./stage/*'], -> connect.reload()

gulp.task 'default', ['watch', 'watchify']

createBundle = (watch=false) ->
  args =
    entries: './src/coffee/main.coffee'
    extensions: ['.coffee', '.jade']

  bundle = ->
    gutil.log('Browserify: bundling')
    bundler.bundle(standalone: 'FacetedSearch')
    .pipe(source("src.js"))
    .pipe(gulp.dest("./dist"))
    .pipe(streamify(uglify()))
    .pipe(rename(extname: '.min.js'))
    .pipe(gulp.dest("./dist"))
    .pipe(connect.reload())

  if watch
    bundler = watchify args
    bundler.on 'update', bundle
  else
    bundler = browserify args

  bundler.exclude 'jquery'
  bundler.exclude 'backbone'
  bundler.exclude 'underscore'

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

gulp.task 'build', ['browserify', 'stylus']

gulp.task 'default', ['connect', 'watch', 'watchify']