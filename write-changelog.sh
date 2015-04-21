#!/usr/bin/env node

var exec = require('child_process').exec,
	path = require('path'),
	fs = require('fs'),
	child;

var pkg = require(path.resolve(__dirname, "package.json"));

child = exec("git log `git describe --tags --abbrev=0`..HEAD --pretty=format:' * %s'",
	function (error, stdout, stderr) {
		if (error !== null) {
		  return console.log('exec error: ' + error);
		}

		var p = path.resolve(__dirname, 'History.md')
		fs.readFile(p, "utf-8", function(err, data) {
			var d = new Date();
			var formattedDate = "\t(" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + ")";
			var header = "### v" + pkg.version + formattedDate;
			var data = header + "\n" + stdout + "\n\n" + data;

			fs.writeFile(p, data, function(err) {
				if (err == null) {
					console.log("Changelog written!")
				}
			});
		});
	}
);