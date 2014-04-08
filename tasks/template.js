"use strict";

// modules
var fs = require("fs");
var Handlebars = require("handlebars");
var through = require("through2");

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
var transform = function (file, enc, cb) {

	var source = file.contents.toString(),
		template = Handlebars.compile(source),
		html = template(data);

	file.contents = new Buffer(html);

	this.push(file);

	cb();

};

module.exports = function () {
	data = JSON.parse(fs.readFileSync("dist/assets/json/data.json"));
	registerPartials();
	return through.obj(transform);
};