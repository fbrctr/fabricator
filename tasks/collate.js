/**
 * Collate the components, structures, and prototypes.
 * Gets contents of files, parses, and creates JSON
 */

"use strict";

module.exports = function (grunt) {

	// modules
	var fs = require("fs"),
		markdown = require("marked"),
		cheerio = require("cheerio"),
		Handlebars = require("handlebars"),
		changeCase = require("change-case"),
		beautifyHtml = require("js-beautify").html,
		mkpath = require("mkpath");

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

	// json object to store data
	var jsonContent = {};

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
	 * Get files in src/components directory and use to generate component page
	 */
	grunt.registerTask("collate-components", function () {

		// read dir
		var componentArray = fs.readdirSync("src/components/");

		// scaffold json object
		jsonContent.components = [];

		// iterate over items in component dir
		for (var i = 0; i < componentArray.length; i++) {

			var component = {};

			component.id = componentArray[i].replace(".html", "");
			component.name = changeCase.titleCase(component.id.replace(/-/ig, " "));
			component.content = fs.readFileSync("src/components/" + componentArray[i], "utf-8");

			// add component to components array
			jsonContent.components.push(component);

			registerHelper(component);

		}

	});


	/**
	 * Get files in src/structures directory and use to generate component page
	 */
	grunt.registerTask("collate-structures", function () {

		// read dir
		var structureArray = fs.readdirSync("src/structures/");

		// scaffold json object
		jsonContent.structures = [];

		// iterate over items in component dir
		for (var i = 0; i < structureArray.length; i++) {

			var structure = {};

			var source = fs.readFileSync("src/structures/" + structureArray[i], "utf-8");
			var template = Handlebars.compile(source);

			structure.id = structureArray[i].replace(".html", "");
			structure.name = changeCase.titleCase(structure.id.replace(/-/ig, " "));
			structure.content = beautifyHtml(template(), beautifyOptions);

			// add component to structures array
			jsonContent.structures.push(structure);

			registerHelper(structure);

		}

	});


	/**
	 * Get files in src/prototypes directory and use to generate component page
	 */
	grunt.registerTask("collate-prototypes", function () {

		// read dir
		var prototypeArray = fs.readdirSync("src/prototypes/");

		// scaffold json object
		jsonContent.prototypes = [];

		// iterate over items in component dir
		for (var i = 0; i < prototypeArray.length; i++) {

			var prototype = {};

			var source = fs.readFileSync("src/prototypes/" + prototypeArray[i], "utf-8");
			var template = Handlebars.compile(source);

			prototype.id = prototypeArray[i].replace(".html", "");
			prototype.name = changeCase.titleCase(prototype.id.replace(/-/ig, " "));
			prototype.content = beautifyHtml(template(), beautifyOptions);

			// add component to structures array
			jsonContent.prototypes.push(prototype);

			registerHelper(prototype);

		}

	});


	/**
	 * Get files in src/components directory and use to generate component page
	 */
	grunt.registerTask("collate-docs", function () {

		// read dir
		var docArray = fs.readdirSync("src/documentation/");

		// scaffold json object
		jsonContent.documentation = [];

		// util function to convert string to title case
		var toTitleCase = function (str) {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		};

		// iterate over items in component dir
		for (var i = 0; i < docArray.length; i++) {

			var documentationObj = {};

			// plain name
			documentationObj.id = docArray[i].replace(".md", "");

			// formated name
			documentationObj.name = toTitleCase(documentationObj.id.replace(/-/ig, " "));

			// get contents of file
			documentationObj.content = {};
			documentationObj.content.markdown = fs.readFileSync("src/documentation/" + docArray[i], "utf-8");
			documentationObj.content.html = markdown(documentationObj.content.markdown);

			// add to component array
			jsonContent.documentation.push(documentationObj);

		}

	});


	// register grunt task
	grunt.registerTask("collate-write-json", function () {
		// write file
		mkpath.sync("src/assets/json");
		fs.writeFileSync("src/assets/json/data.json", JSON.stringify(jsonContent));
	});

};