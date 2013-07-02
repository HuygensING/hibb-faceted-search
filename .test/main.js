require.config({
	baseUrl: '/dev/js/',
	paths: {
		mocha: '../lib/mocha/mocha',
		chai: '../lib/chai/chai'
		// jquery: 'lib/jquery-1.9.1'
	}
});

require(['require', 'mocha'], function(require)  {
	mocha.setup('bdd');

	require(['../../.test/tests.js'], function() {
		if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
		else { mocha.run(); }
	});
});