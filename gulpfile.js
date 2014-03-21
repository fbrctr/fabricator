"use strict";

// plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var plumber = require("gulp-plumber");
var gulpif = require("gulp-if");
var Q = require("q");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var clean = require("gulp-clean");
var sass = require("gulp-ruby-sass");
var csso = require("gulp-csso");
var prefix = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
var browserify = require("gulp-browserify");
var collate = require("./tasks/collate");
var template = require("./tasks/template");
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
			trace: true
		}))
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(rename("f.css"))
		.pipe(gulp.dest("dist/assets/css"))
		.pipe(gulpif(!gutil.env.production, connect.reload()));
});

gulp.task("styles:toolkit", function () {
	return gulp.src("src/toolkit/assets/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sass({
			trace: true
		}))
		.pipe(prefix("last 1 version"))
		.pipe(gulpif(gutil.env.production, csso()))
		.pipe(gulp.dest("dist/toolkit/css"))
		.pipe(gulpif(!gutil.env.production, connect.reload()));
});

gulp.task("styles", ["styles:fabricator", "styles:toolkit"]);


// scripts
gulp.task("scripts:fabricator", function () {
	return gulp.src(["src/fabricator/js/prism.js", "src/fabricator/js/fabricator.js"])
		.pipe(plumber())
		.pipe(concat("f.js"))
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulp.dest("dist/assets/js"))
		.pipe(gulpif(!gutil.env.production, connect.reload()));
});

gulp.task("scripts:toolkit", function () {
	return gulp.src("src/toolkit/assets/js/toolkit.js")
		.pipe(plumber())
		.pipe(browserify())
		.pipe(gulpif(gutil.env.production, uglify()))
		.pipe(gulp.dest("dist/toolkit/js"))
		.pipe(gulpif(!gutil.env.production, connect.reload()));
});

gulp.task("scripts", ["scripts:fabricator", "scripts:toolkit"]);


// images
gulp.task("images", function () {
	return gulp.src("src/toolkit/assets/img/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest("dist/toolkit/img")
		.pipe(gulpif(!gutil.env.production, connect.reload())));
});


// collate
gulp.task("collate", function () {

	// "collate" is a little different -
	// it returns a promise instead of a stream

	var deferred = Q.defer();

	var opts = {
		materials: [
			"components",
			"structures",
			"prototypes",
			"documentation"
		],
		dest: "dist/assets/json/data.json"
	};

	collate(opts, deferred.resolve);

	return deferred.promise;

});

// templates
gulp.task("template", ["collate"], function () {
	return gulp.src("src/toolkit/views/*.html")
		.pipe(template())
		.pipe(gulp.dest("dist"))
		.pipe(gulpif(!gutil.env.production, connect.reload()));
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

	gulp.watch("src/toolkit/{components,structures,prototypes,documentation,views}/*.{html,md}", ["template"]);
	gulp.watch("src/fabricator/scss/**/*.scss", ["styles:fabricator"]);
	gulp.watch("src/toolkit/assets/scss/**/*.scss", ["styles:toolkit"]);
	gulp.watch("src/fabricator/js/**/*.js", ["scripts:fabricator"]);
	gulp.watch("src/toolkit/assets/js/**/*.js", ["scripts:toolkit"]);

});


// build
gulp.task("build", ["clean"], function () {
	gulp.start("styles", "scripts", "images", "template");
});


// dev
gulp.task("dev", ["build"], function () {
	gulp.start("watch");
});


// release build
gulp.task("default", ["build"]);
