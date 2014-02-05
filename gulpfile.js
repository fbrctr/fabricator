"use strict";

/**
 * Plugins
 */
var gulp = require("gulp");
var gutil = require("gulp-util");
var es = require("event-stream");
var serve = require("gulp-serve");
var watch = require("gulp-watch");
var clean = require("gulp-clean");
var sass = require("gulp-sass");
var csso = require("gulp-csso");
var prefix = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
var browserify = require("gulp-browserify");
var compileToolkitJs = require("./tasks/compile-toolkit.js");


/**
 * Tasks
 */

// clean
gulp.task("clean", function () {
	return gulp.src(["dist"], {read: false})
		.pipe(clean());
});

// styles
gulp.task("styles", function () {
	return es.merge(
		gulp.src("src/assets/scss/fabricator.scss")
			.pipe(sass())
			.pipe(prefix("last 1 version"))
			.pipe(csso())
			.pipe(gulp.dest("dist/assets/css")),
		gulp.src("src/toolkit/scss/toolkit.scss")
			.pipe(sass())
			.pipe(prefix("last 1 version"))
			.pipe(csso())
			.pipe(gulp.dest("dist/toolkit/css"))
	);
});

// scripts
gulp.task("scripts", function () {
	return es.merge(
		gulp.src("src/assets/js/fabricator.js")
			.pipe(uglify())
			.pipe(gulp.dest("dist/assets/js")),
		gulp.src("src/toolkit/js/toolkit.js")
			.pipe(compileToolkitJs())
			.pipe(uglify())
			.pipe(gulp.dest("dist/toolkit/js"))
	);
});

// images
gulp.task("images", function () {

});

// data
gulp.task("data", function () {

});

// templates
gulp.task("templates", ["data"], function () {

});

// build
gulp.task("build", ["clean"], function () {
	gulp.start("styles", "scripts", "images", "templates");
});


// serve
gulp.task("serve", serve({
	root: ["dist"],
	port: 9000
}));


// dev
// build, connect, serve, watch
// css and html files compile to dist
// env varible to determine whether or not to pipe uglification/minification
// css/js only minified during default task
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/pass-params-from-cli.md
gulp.task("dev", [], function () {

});


// release build
gulp.task("default", ["build"]);
