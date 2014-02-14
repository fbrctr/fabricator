"use strict";

// plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var plumber = require("gulp-plumber");
var gulpif = require("gulp-if");
var es = require("event-stream");
var concat = require("gulp-concat");
var serve = require("gulp-serve");
var watch = require("gulp-watch");
var clean = require("gulp-clean");
var sass = require("gulp-sass");
var csso = require("gulp-csso");
var prefix = require("gulp-autoprefixer");
var browserify = require("gulp-browserify");
var uglify = require("gulp-uglify");
var browserify = require("gulp-browserify");
var collate = require("./tasks/collate");
var template = require("./tasks/compile-templates");
var connect = require("gulp-connect");
var watch = require("gulp-watch");
var rename = require("gulp-rename");


// env vars
gutil.env.production = gutil.env.production || false;


// clean
gulp.task("clean", function () {
	return gulp.src(["dist"], {
		read: false
	}).pipe(clean());
});


// styles
gulp.task("styles:fabricator", function () {
	return gulp.src("src/fabricator/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(rename("f.css"))
		.pipe(gulpif(!gutil.env.production, connect.reload()))
		.pipe(gulp.dest("dist/assets/css"));
});

gulp.task("styles:toolkit", function () {
	return gulp.src("src/toolkit/assets/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(gulpif(!gutil.env.production, connect.reload()))
		.pipe(gulp.dest("dist/toolkit/css"));
});

gulp.task("styles", function () {
	gulp.start("styles:fabricator", "styles:toolkit");
});


// scripts
gulp.task("scripts:fabricator", function () {
	return gulp.src("src/fabricator/js/{prism,fabricator}.js")
		.pipe(plumber())
		.pipe(concat("f.js"))
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulpif(!gutil.env.production, connect.reload()))
		.pipe(gulp.dest("dist/assets/js"));
});

gulp.task("scripts:toolkit", function () {
	return gulp.src("src/toolkit/assets/js/toolkit.js")
		.pipe(plumber())
		.pipe(browserify())
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulpif(!gutil.env.production, connect.reload()))
		.pipe(gulp.dest("dist/toolkit/js"));
});

gulp.task("scripts", function () {
	gulp.start("scripts:fabricator", "scripts:toolkit");
});


// images
gulp.task("images", function () {
	// TODO add image task
});


// data
gulp.task("data", function () {
	return gulp.src("src/toolkit/{components,structures,prototypes,documentation}/*.{md,html}")
		.pipe(collate("dist/assets/json")); // TODO make this output a json file to gulp.dest
});

// templates
gulp.task("templates", ["data"], function () {
	return gulp.src("src/toolkit/views/**/*")
		.pipe(template())
		.pipe(gulpif(!gutil.env.production, connect.reload()))
		.pipe(gulp.dest("dist")); // TODO prevent partials dir from outputing
});


// server
gulp.task("serve", connect.server({
	root: ["dist"],
	port: 9000,
	livereload: true
}));

// watch
gulp.task("watch", ["serve"], function () {
	gulp.watch("src/toolkit/{components,structures,prototypes,documentation,views}/**/*", ["templates"]);
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
	// serve
	gulp.start("watch");
});


// release build
gulp.task("default", ["build"]);