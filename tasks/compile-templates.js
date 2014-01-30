"use strict";

module.exports = function (grunt) {

	// modules
	var fs = require("fs"),
		Handlebars = require("handlebars"),
		mkpath = require("mkpath");


	/**
	 * Register each partial with Handlebars
	 */
	var registerPartials = function () {

		var partials = fs.readdirSync("src/views/partials"),
			html;

		for (var i = partials.length - 1; i >= 0; i--) {
			html = fs.readFileSync("src/views/partials/" + partials[i], "utf-8");
			Handlebars.registerPartial(partials[i].replace(/.html/, ""), html);
		}

	};


	/**
	 * Pass views through Handlebars; save to .tmp
	 */
	var templateViews = function () {

		var data = JSON.parse(fs.readFileSync("src/assets/json/data.json")),
			views, source, template, output;

		views = fs.readdirSync("src/views").filter(function (file) {
			return file.substr(-5) === ".html";
		});

		for (var i = views.length - 1; i >= 0; i--) {
			source = fs.readFileSync("src/views/" + views[i], "utf-8");
			template = Handlebars.compile(source);
			output = template(data);
			fs.writeFileSync(".tmp/" + views[i], output);
		}

	};

	// register grunt task
	grunt.registerTask("compile-templates", "Compile views to html", function () {
		mkpath.sync(".tmp");
		registerPartials();
		templateViews();
	});

};