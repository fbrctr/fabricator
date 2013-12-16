/**
 * Compile page content
 * Get contents of files, parse, and create JSON
 */

"use strict";

module.exports = function (grunt) {

	// get node modules
	var fs = require("fs");
	var markdown = require("marked");
	var _ = require("lodash");
	var changeCase = require("change-case");
	var beautifyHtml = require("js-beautify").html;

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

	// create json object to store data
	var jsonContent = {};


	/**
	 * Get files in src/components directory and use to generate component page
	 */
	grunt.registerTask("collate-components", function () {

		// read dir
		var componentArray = fs.readdirSync("src/components/");

		// scaffold json object
		jsonContent.components = {};

		// iterate over items in component dir
		for (var i = 0; i < componentArray.length; i++) {

			var componentObj = {};

			var id = componentArray[i].replace(".html", ""),
				name = changeCase.camelCase(id);

			// add component to components object
			jsonContent.components[name] = fs.readFileSync("src/components/" + componentArray[i], "utf-8");

		}

	});


	/**
	 * Get files in src/structures directory and use to generate component page
	 */
	grunt.registerTask("collate-structures", function () {

		// read dir
		var structureArray = fs.readdirSync("src/structures/");

		// scaffold json object
		jsonContent.structures = {};

		// iterate over items in component dir
		for (var i = 0; i < structureArray.length; i++) {

			var structureObj = {};

			var id = structureArray[i].replace(".html", ""),
				name = changeCase.camelCase(id),
				template = fs.readFileSync("src/structures/" + structureArray[i], "utf-8"),
				content = _.template(template, jsonContent);


			// add component to structures object
			jsonContent.structures[name] = beautifyHtml(content, beautifyOptions);

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
			documentationObj.name = docArray[i].replace(".md", "");

			// formated name
			documentationObj.niceName = toTitleCase(documentationObj.name.replace(/-/ig, " "));

			// get contents of file
			documentationObj.content = {};
			documentationObj.content.markdown = fs.readFileSync("src/documentation/" + docArray[i], "utf-8");
			documentationObj.content.html = markdown(documentationObj.content.markdown);

			// add to component array
			jsonContent.documentation.push(documentationObj);

		}

	});

	grunt.registerTask("collate-write-json", function () {
		// write file
		fs.writeFileSync("src/assets/json/data.json", JSON.stringify(jsonContent));
	});


};
