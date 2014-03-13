"use strict";

// plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var plumber = require("gulp-plumber");
var gulpif = require("gulp-if");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var clean = require("gulp-clean");
var sass = require("gulp-sass");
var csso = require("gulp-csso");
var prefix = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
var browserify = require("gulp-browserify");
var collate = require("./tasks/collate");
var template = require("./tasks/compile-templates");
var connect = require("gulp-connect");
var imagemin = require("gulp-imagemin");


// env vars
gutil.env.production = gutil.env.production || false;


// clean
gulp.task("clean", function () {
	return gulp.src(["dist"], {
		read: false
	})
	.pipe(clean());
});


// styles
gulp.task("styles:fabricator", function () {
	return gulp.src("src/fabricator/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(rename("f.css"))
		.pipe(gulp.dest("dist/assets/css"));
});

gulp.task("styles:toolkit", function () {
	return gulp.src("src/toolkit/assets/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(gulp.dest("dist/toolkit/css"));
});

gulp.task("styles", ["styles:fabricator", "styles:toolkit"]);


// scripts
gulp.task("scripts:fabricator", function () {
	return gulp.src(["src/fabricator/js/prism.js", "src/fabricator/js/fabricator.js"])
		.pipe(plumber())
		.pipe(concat("f.js"))
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulp.dest("dist/assets/js"));
});

gulp.task("scripts:toolkit", function () {
	return gulp.src("src/toolkit/assets/js/toolkit.js")
		.pipe(plumber())
		.pipe(browserify())
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulp.dest("dist/toolkit/js"));
});

gulp.task("scripts", ["scripts:fabricator", "scripts:toolkit"]);


// images
gulp.task("images", function () {
	return gulp.src("src/toolkit/assets/img/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest("dist/toolkit/img"));
});


// collate
gulp.task("collate", function () {
	return gulp.src(["src/toolkit/{components,structures,prototypes,documentation}/*.html", "src/toolkit/{components,structures,prototypes,documentation}/*.md"])
		.pipe(collate("dist/assets/json")); // TODO make this output a json file to gulp.dest
});

// templates
gulp.task("templates", ["collate"], function () {
	return gulp.src("src/toolkit/views/*.html")
		.pipe(template())
		.pipe(gulp.dest("dist"));
});


// server
gulp.task("connect", connect.server({
	root: ["dist"],
	port: 9000,
	livereload: true,
	open: {
		file: ""
	}
}));

// watch
gulp.task("watch", ["connect"], function () {

	gulp.watch([
		"src/toolkit/**/*.{html,md}",
		"src/{fabricator,toolkit}/**/*.js",
		"src/{fabricator,toolkit}/**/*.scss",
		"src/toolkit/assets/img/**/*"
	], function(event) {
		return gulp.src(event.path)
			.pipe(connect.reload());
	});

	gulp.watch("src/toolkit/{components,structures,prototypes,documentation,views}/*.{html,md}", ["templates"]);
	gulp.watch("src/fabricator/scss/**/*.scss", ["styles:fabricator"]);
	gulp.watch("src/toolkit/assets/scss/**/*.scss", ["styles:toolkit"]);
	gulp.watch("src/fabricator/js/**/*.js", ["scripts:fabricator"]);
	gulp.watch("src/toolkit/assets/js/**/*.js", ["scripts:toolkit"]);

});


// build
gulp.task("build", ["clean"], function () {
	gulp.start("styles", "scripts", "images", "templates");
});


// dev
gulp.task("dev", ["build"], function () {
	gulp.start("watch");
});


// release build
gulp.task("default", ["build"]);