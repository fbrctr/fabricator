/**
 * Compile page content
 * Get contents of files, parse, and create JSON
 */

"use strict";

module.exports = function (grunt) {

	// get node modules
	var fs = require("fs");
	var markdown = require("marked");

	// configure marked
	markdown.setOptions({
		langPrefix: "language-"
	});

	// create json object to store data
	var jsonContent = {};

	/**
	 * Get files in src/components directory and use to generate component page
	 */
	grunt.registerTask("collate-components", function () {

		// read dir
		var componentArray = fs.readdirSync("src/components/");

		// scaffold json object
		jsonContent.components = [];

		// util function to convert string to title case
		var toTitleCase = function (str) {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		};

		// iterate over items in component dir
		for (var i = 0; i < componentArray.length; i++) {

			var componentObj = {};

			// plain name
			componentObj.name = componentArray[i].replace(".html", "");

			// formated name
			componentObj.niceName = toTitleCase(componentArray[i].replace(".html", "").replace(/-/ig, " "));

			// get contents of file
			componentObj.content = fs.readFileSync("src/components/" + componentArray[i], "utf-8");

			// add to component array
			jsonContent.components.push(componentObj);

		}

		// write file
		// fs.writeFileSync("src/assets/json/data.json", JSON.stringify(jsonContent));

		// display output in grunt
		grunt.log.writelns(JSON.stringify(jsonContent));

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

		// display output in grunt
		grunt.log.writelns(JSON.stringify(jsonContent));

	});

	grunt.registerTask("collate-write-json", function () {
		// write file
		fs.writeFileSync("src/assets/json/data.json", JSON.stringify(jsonContent));
	});


};
