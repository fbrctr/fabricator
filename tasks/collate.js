/**
 * Collate "materials" - html and md files
 * @description Gets contents of files, parses, and creates JSON
 */

'use strict';

var beautifyHtml = require('js-beautify').html;
var changeCase = require('change-case');
var cheerio = require('cheerio');
var fs = require('fs');
var gutil = require('gulp-util');
var Handlebars = require('handlebars');
var junk = require('junk');
var markdown = require('marked');
var mkpath = require('mkpath');
var path = require('path');


/**
 * Compiled component/structure/etc data
 * @type {Object}
 */
var data;


// configure marked
markdown.setOptions({
	langPrefix: 'language-'
});


// configure beautifier
var beautifyOptions = {
	'indent_size': 1,
	'indent_char': '    ',
	'indent_with_tabs': true
};


/**
 * Register each component and structure as a helper in Handlebars
 * This turns each item into a helper so that we can
 * include them in other files.
 */
var registerHelper = function (item) {

	Handlebars.registerHelper(item.id, function () {

		// get helper classes if passed in
		var helperClasses = (typeof arguments[0] === 'string') ? arguments[0] : '';

		// init cheerio
		var $ = cheerio.load(item.content);

		// add helper classes to first element
		$('*').first().addClass(helperClasses);

		return new Handlebars.SafeString($.html());

	});

};


/**
 * Block iteration
 * @description Repeat a block a given amount of times.
 * @example
 * {{#iterate 20}}
 *   <li>List Item</li>
 * {{/iterate}}
 */
Handlebars.registerHelper('iterate', function (n, block) {
	var accum = '';
	for (var i = 0; i < n; ++i) {
		accum += block.fn(i);
	}
	return accum;
});


/**
 * Parse a directory of files
 * @param {Sting} dir The directory that contains .html and .md files to be parsed
 * @return {Function} A stream
 */
var parse = function (dir) {

	// create key if it doesn't exist
	if (!data[dir]) {
		data[dir] = {};
	}

	// get directory contents
	var raw = fs.readdirSync('src/toolkit/' + dir).filter(junk.not);

	// create an array of file names
	var fileNames = raw.map(function (e, i) {
		return e.replace(path.extname(e), '');
	});

	// de-dupe file names (both .html and .md present)
	var items = fileNames.filter(function (e, i, a) {
		return a.indexOf(e) === i;
	});

	// iterate over each item, parse, add to item object
	for (var i = 0, length = items.length; i < length; i++) {

		var item = {};

		item.id = items[i];
		item.name = changeCase.titleCase(item.id.replace(/-/ig, ' '));

		try {
			// compile templates
			var content = fs.readFileSync('src/toolkit/' + dir + '/' + items[i] + '.html', 'utf8').replace(/(\s*(\r?\n|\r))+$/, '');
			var template = Handlebars.compile(content);
			item.content = beautifyHtml(template(), beautifyOptions);
			// register the helper
			registerHelper(item);
		} catch (e) {}

		try {
			var notes = fs.readFileSync('src/toolkit/' + dir + '/' + items[i] + '.md', 'utf8');
			item.notes = markdown(notes);
		} catch (e) {}

		data[dir][item.id.replace(/-/g, '')] = item;
	}

};


module.exports = function (opts, cb) {

	data = {};

	// iterate over each "materials" directory
	for (var i = 0, length = opts.materials.length; i < length; i++) {
		parse(opts.materials[i]);
	}

	// write the json file
	mkpath.sync(path.dirname(opts.dest));

	fs.writeFile(opts.dest, JSON.stringify(data), function (err) {
		if (err) {
			gutil.log(err);
		} else {
			cb();
		}
	});

};
