gulp = require 'gulp'
gutil = require 'gulp-util'
stylus = require 'gulp-stylus'
concat = require 'gulp-concat'
coffee = require 'gulp-coffee'
browserify = require 'browserify'
watchify = require 'watchify'
source = require 'vinyl-source-stream'
uglify = require 'gulp-uglify'
streamify = require 'gulp-streamify'
rename = require 'gulp-rename'
clean = require 'gulp-clean'
pkg = require './package.json'
exec = require('child_process').exec

currentVersion = null

gulp.task 'current-version', (done) ->
  exec 'git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) ->
    #    Use stdout.trim() to remove the newline char
    out = stdout.trim()
    currentVersion = if out is 'development' then out else pkg.version
    done()


gulp.task 'stylus', ->
  gulp.src(['./src/**/*.styl'])
    .pipe(stylus())
    .pipe(concat('main.css'))
    .pipe(gulp.dest(__dirname))

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

gulp.task 'default', ['watch', 'watchify']

createBundle = (watch=false) ->
  args =
    entries: './src/coffee/main.coffee'
    extensions: ['.coffee', '.jade']

  if watch
    bundler = watchify args
    bundler.on 'update', bundle
  else
    bundler = browserify args

  bundler.exclude 'jquery'
  bundler.exclude 'backbone'
  bundler.exclude 'underscore'

  bundle = ->
    gutil.log('Browserify: bundling')
    bundler.bundle(standalone: 'FacetedSearch')
      .pipe(source("src.js"))
      .pipe(gulp.dest("./dist/#{currentVersion}"))
      .pipe(streamify(uglify()))
      .pipe(rename(extname: '.min.js'))
      .pipe(gulp.dest("./dist/#{currentVersion}"))

  bundle()

gulp.task 'browserify-src', ['current-version'], -> createBundle false
gulp.task 'watchify', ['current-version'], -> createBundle true

gulp.task 'browserify-libs', ['current-version'], ->
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
    .pipe(gulp.dest("./dist/#{currentVersion}"))
    .pipe(streamify(uglify()))
    .pipe(rename(extname: '.min.js'))
    .pipe(gulp.dest("./dist/#{currentVersion}"))

gulp.task 'browserify', ['browserify-src', 'browserify-libs', 'current-version'], ->
  src = ["./dist/#{currentVersion}/libs.js", "./dist/#{currentVersion}/src.js"]

  gulp.src(src)
    .pipe(concat("main.js"))
    .pipe(gulp.dest("./dist/#{currentVersion}"))
    .pipe(streamify(uglify()))
    .pipe(rename(extname: '.min.js'))
    .pipe(gulp.dest("./dist/#{currentVersion}"))

gulp.task 'clean-latest', -> gulp.src('./dist/latest', read: false).pipe(clean())

gulp.task 'build', ['browserify', 'clean-latest', 'current-version'], ->
  gulp.src("dist/#{currentVersion}/**/*")
    .pipe(gulp.dest("./dist/latest"))