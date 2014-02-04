tests = []
for file of window.__karma__.files
	tests.push file  if /-spec\.js$/.test(file)

requirejs.config
	# Karma serves files from '/base'
	baseUrl: "/base/src"
	paths:
		chai: "../compiled/lib/chai/chai"
		backbone: "../compiled/lib/backbone-amd/backbone-min"
		jquery: "../compiled/lib/jquery/jquery.min"
		underscore: "../compiled/lib/underscore-amd/underscore-min"
		models: '../src/coffee/models'
		hilib: '../compiled/lib/hilib/compiled'

		# TODO: Which files need manual adding?
		config: '../src/coffee/config'
	shim:
		chai:
			exports: "chai"
	
	# ask Require.js to load these files (all our tests)
	deps: tests
	
	# start test run, once Require.js is done
	callback: window.__karma__.start
