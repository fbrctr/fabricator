"use strict";

// modules
var fs = require("fs");
var Handlebars = require("handlebars");
var gutil = require("gulp-util");
var es = require("event-stream");
var map = require("vinyl-map");


var data;

/**
 * Register partials with Handlebars
 */
var registerPartials = function () {

	var partials = fs.readdirSync("src/toolkit/views/partials"),
		html;

	for (var i = partials.length - 1; i >= 0; i--) {
		html = fs.readFileSync("src/toolkit/views/partials/" + partials[i], "utf-8");
		Handlebars.registerPartial(partials[i].replace(/.html/, ""), html);
	}

};


/**
 * Pass views through Handlebars
 */
var template = function (contents, data) {

	var source = contents.toString(),
		template = Handlebars.compile(source);

	return template(data);

};

module.exports = function (file, data) {
	// data = JSON.parse(fs.readFileSync("dist/assets/json/data.json"));
	registerPartials();
	// console.log("file", file.toString())
	return template(file.toString(), data);
};