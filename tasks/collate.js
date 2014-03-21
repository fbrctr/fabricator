/**
 * Collate the components, structures, and prototypes.
 * Gets contents of files, parses, and creates JSON
 */

"use strict";

var fs = require("fs");
var path = require("path");
var gutil = require("gulp-util");
var Q = require("q");
var markdown = require("marked");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var changeCase = require("change-case");
var beautifyHtml = require("js-beautify").html;
var mkpath = require("mkpath");
var through = require("through2");

/**
 * Deferred object
 * @type {Promise}
 */
var deferred = Q.defer();


/**
 * Compiled component/structure/etc data
 * @type {Object}
 */
var data;


// configure marked
markdown.setOptions({
	langPrefix: "language-"
});


// configure beautifier
var beautifyOptions = {
	"indent_size": 1,
	"indent_char": "	",
	"indent_with_tabs": true
};


/**
 * Register each component and structure as a helper in Handlebars
 * This turns each item into a helper so that we can
 * include them in other files.
 */
var registerHelper = function (item) {

	Handlebars.registerHelper(item.id, function () {

		// get helper classes if passed in
		var helperClasses = (typeof arguments[0] === "string") ? arguments[0] : "";

		// init cheerio
		var $ = cheerio.load(item.content);

		// add helper classes to first element
		$("*").first().addClass(helperClasses);

		return new Handlebars.SafeString($.html());

	});

};


/**
 * Parse a directory of files
 * @param {Sting} dir The directory that contains .html and .md files to be parsed
 * @return {Function} A stream
 */
var parse = function (dir) {

	// create key if it doesn't exist
	if (!data[dir]) {
		data[dir] = [];
	}

	// TODO
	// create an array of "items" - go through (readdir) the list of files and de-dupe
	// iterate over that array and parse each item, grabbing/parsing the html/md adhoc
	var raw = fs.readdirSync("src/toolkit/" + dir);

	var fileNames = raw.map(function (e, i) {
		return e.replace(path.extname(e), "");
	});



	var items = fileNames.filter(function (e, i, a) {
		return a.indexOf(e) === i;
	});



	for (var i = 0, length = items.length; i < length; i++) {

		var item = {};

		item.id = items[i];
		item.name = changeCase.titleCase(item.id.replace(/-/ig, " "));

		try {
			// compile templates
			var content = fs.readFileSync("src/toolkit/" + dir + "/" + items[i] + ".html", "utf8");
			var template = Handlebars.compile(content);
			item.content = beautifyHtml(template(), beautifyOptions);
			// register the helper
			registerHelper(item);
		} catch (e) {}

		try {
			var notes = fs.readFileSync("src/toolkit/" + dir + "/" + items[i] + ".md", "utf8");
			item.notes = markdown(notes);
		} catch (e) {}

		data[dir].push(item);
	}

};


module.exports = function (opts, cb) {

	data = {};

	for (var i = 0, length = opts.materials.length; i < length; i++) {
		parse(opts.materials[i]);
	}

	mkpath.sync(path.dirname(opts.dest));

	fs.writeFile(opts.dest, JSON.stringify(data), function (err) {
		if (err) {
			gutil.log(err);
		} else {
			cb();
		}
	});

	// return deferred.promise;
};