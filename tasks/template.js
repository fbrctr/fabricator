'use strict';

// modules
var fs = require('fs');
var Handlebars = require('handlebars');
var through = require('through2');

/**
 * Contents of data.json
 * @type {Object}
 */
var data;


/**
 * Register partials with Handlebars
 */
var registerPartials = function () {

	var partials = fs.readdirSync('src/toolkit/views/partials'),
		html;

	for (var i = partials.length - 1; i >= 0; i--) {
		html = fs.readFileSync('src/toolkit/views/partials/' + partials[i], 'utf-8');
		Handlebars.registerPartial(partials[i].replace(/.html/, ''), html);
	}

};


/**
 * Pass views through Handlebars
 */
var template = function (file, enc, cb) {

	var source = file.contents.toString(),
		template = Handlebars.compile(source),
		html = template(data);

	file.contents = new Buffer(html);

	this.push(file);

	cb();

};

module.exports = function (opts) {
	data = JSON.parse(fs.readFileSync(opts.data));
	registerPartials();
	return through.obj(template);
};
