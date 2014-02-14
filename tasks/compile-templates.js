"use strict";

// modules
var fs = require("fs"),
	Handlebars = require("handlebars"),
	mkpath = require("mkpath");

var gutil = require("gulp-util");

var es = require("event-stream");
var map = require("vinyl-map");


var data;

/**
 * Register each partial with Handlebars
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
 * Pass views through Handlebars; save to .tmp
 */
var templateViews = function (file, enc, callback) {

	var views = fs.readdirSync("src/toolkit/views").filter(function (file) {
		return file.substr(-5) === ".html";
	});

	var source, template, output;

	for (var i = views.length - 1; i >= 0; i--) {
		source = file.contents.toString();
		template = Handlebars.compile(source);
		output = template(data);
		// fs.writeFileSync(".tmp/" + views[i], output);
		this.push(file);
	}

	return callback();

};

var template = function (contents, path) {

	var source = contents.toString(),
		template = Handlebars.compile(source);

	return template(data);

};

module.exports = function () {
	data = JSON.parse(fs.readFileSync("dist/assets/json/data.json"));
	registerPartials();
	return es.pipeline(map(template));
};