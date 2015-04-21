#!/usr/bin/env node

var exec = require('child_process').exec,
	path = require('path'),
	fs = require('fs');

var pkg = require(path.resolve(__dirname, "package.json"));

// Get a list of all commit message between the previous tag and HEAD.
exec("git log `git describe --tags --abbrev=0`..HEAD --pretty=format:' * %s'", function (error, stdout, stderr) {
	if (error !== null) {
		return console.log('exec error: ' + error);
	}

	var p = path.resolve(__dirname, 'History.md')

	// Read History.md
	fs.readFile(p, "utf-8", function(err, data) {
		// Create the header ie: ### v2.5.3 (2015/04/03)
		var d = new Date();
		var formattedDate = "\t(" + d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + ")";
		var header = "### v" + pkg.version + formattedDate;
		
		var lines = stdout.toString().split('\n');

		lines = lines.filter(function(line) {
			return line.substr(0, 9) !== "Bump to v"
		});

		// Concatenate the header, the commits (stdout) and the old History.md
		var commits = header + "\n" + lines.join("\n") + "\n\n" + data;

		// Write the new changelog to History.md
		fs.writeFile(p, commits, function(err) {
			if (err == null) {
				console.log("Changelog written!\n\n"+stdout)
			}
		}); // writeFile
	}); // readFile
}); // exec