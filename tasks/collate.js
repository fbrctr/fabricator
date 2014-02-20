/**
 * Collate the components, structures, and prototypes.
 * Gets contents of files, parses, and creates JSON
 */

"use strict";

var fs = require("fs");
var markdown = require("marked");
var cheerio = require("cheerio");
var Handlebars = require("handlebars");
var changeCase = require("change-case");
var beautifyHtml = require("js-beautify").html;
var mkpath = require("mkpath");
var through = require("through2");


/**
 * Compiled component/structure/etc data
 * @type {Object}
 */
var data = {};


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
 * Collate data
 * @return {Function} A stream
 */
var collate = function (file, enc, callback) {

	var pathArr = file.path.split("/"),
		key = pathArr[pathArr.length - 2],
		extension = pathArr[pathArr.length - 1].match(/\.[0-9a-z]+$/)[0].replace(/\./, ""),
		item = {};

	// create key if it doesn't exist
	if (!data[key]) {
		data[key] = [];
	}

	// compile templates
	var template = Handlebars.compile(file.contents.toString());

	// add to item obj
	item.id = pathArr[pathArr.length - 1].replace(/(.[\w]+)$/, "");
	item.name = changeCase.titleCase(item.id.replace(/-/ig, " "));
	item.content = (extension === "md") ? markdown(file.contents.toString()) : beautifyHtml(template(), beautifyOptions);

	// push
	data[key].push(item);
	this.push(file);

	// register the helper
	registerHelper(item);

	return callback();

};


module.exports = function (outputPath) {
	data = {};
	return through.obj(collate, function () {
		mkpath.sync(outputPath);
		fs.writeFileSync(outputPath + "/data.json", JSON.stringify(data));
		this.emit("end");
	});
};