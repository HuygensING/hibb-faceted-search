define(function(require) {
	var $, Fn, chai, mixin;
	chai = require('chai');

	chai.should();

	describe("Tests", function() {
		it("should be able to be performed", function() {
			return "works!".should.be.a('string');
		});
	});
});