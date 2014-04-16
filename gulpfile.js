'use strict';

// modules
var browserify = require('browserify');
var clean = require('gulp-clean');
var collate = require('./tasks/collate');
var concat = require('gulp-concat');
var connect = require('gulp-connect');
var csso = require('gulp-csso');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var prefix = require('gulp-autoprefixer');
var Q = require('q');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var template = require('./tasks/template');
var uglify = require('gulp-uglify');


// configuration
var config = {
	dev: true,
	src: {
		scripts: {
			fabricator: [
				'./src/fabricator/js/prism.js',
				'./src/fabricator/js/fabricator.js'
			],
			toolkit: './src/toolkit/assets/js/toolkit.js'
		},
		styles: {
			fabricator: './src/fabricator/scss/fabricator.scss',
			toolkit: './src/toolkit/assets/scss/toolkit.scss'
		},
		images: './src/toolkit/assets/img/**/*',
		templates: './src/toolkit/views/*.html'
	},
	dest: './dist'
};


// clean
gulp.task('clean', function () {
	return gulp.src([config.dest], {
		read: false
	})
	.pipe(clean());
});


// styles
gulp.task('styles:fabricator', function () {
	return gulp.src(config.src.styles.fabricator)
		.pipe(plumber())
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(gulp.dest(config.dest + '/assets/css'))
		.pipe(gulpif(config.dev, connect.reload()));
});

gulp.task('styles:toolkit', function () {
	return gulp.src(config.src.styles.toolkit)
		.pipe(plumber())
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(gulp.dest(config.dest + '/toolkit/css'))
		.pipe(gulpif(config.dev, connect.reload()));
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);


// scripts
gulp.task('scripts:fabricator', function () {
	return gulp.src(config.src.scripts.fabricator)
		.pipe(plumber())
		.pipe(concat('f.js'))
		.pipe(gulpif(!config.dev, uglify()))
		.pipe(gulp.dest(config.dest + '/assets/js'))
		.pipe(gulpif(config.dev, connect.reload()));
});

gulp.task('scripts:toolkit', function () {
	return browserify(config.src.scripts.toolkit).bundle()
		.pipe(plumber())
		.pipe(source('toolkit.js'))
		.pipe(gulpif(!config.dev, streamify(uglify())))
		.pipe(gulp.dest(config.dest + '/toolkit/js'))
		.pipe(gulpif(config.dev, connect.reload()));
});

gulp.task('scripts', ['scripts:fabricator', 'scripts:toolkit']);


// images
gulp.task('images', function () {
	return gulp.src(config.src.images)
		.pipe(imagemin())
		.pipe(gulp.dest(config.dest + '/toolkit/img'))
		.pipe(gulpif(config.dev, connect.reload()));
});


// collate
gulp.task('collate', function () {

	// 'collate' is a little different -
	// it returns a promise instead of a stream

	var deferred = Q.defer();

	var opts = {
		materials: [
			'components',
			'structures',
			'prototypes',
			'documentation'
		],
		dest: config.dest + '/assets/json/data.json'
	};

	// run the collate task; resolve deferred when complete
	collate(opts, deferred.resolve);

	return deferred.promise;

});

// templates
gulp.task('template', ['collate'], function () {
	var opts = {
		data: config.dest + '/assets/json/data.json'
	};

	return gulp.src(config.src.templates)
		.pipe(template(opts))
		.pipe(gulp.dest(config.dest))
		.pipe(gulpif(config.dev, connect.reload()));
});


// build
gulp.task('build', ['clean'], function () {
	gulp.start('styles', 'scripts', 'images', 'template');
});


// server
gulp.task('connect', connect.server({
	root: [config.dest],
	port: 9000,
	livereload: config.dev ? { port:(Math.floor(Math.random() * (35729 - 35720 + 1) + 35720)) } : false,
	open: {
		file: ''
	}
}));


// watch
gulp.task('watch', ['connect'], function () {
	gulp.watch('./src/toolkit/{components,structures,prototypes,documentation,views}/*.{html,md}', ['template']);
	gulp.watch('./src/fabricator/scss/**/*.scss', ['styles:fabricator']);
	gulp.watch('./src/toolkit/assets/scss/**/*.scss', ['styles:toolkit']);
	gulp.watch('./src/fabricator/js/**/*.js', ['scripts:fabricator']);
	gulp.watch('./src/toolkit/assets/js/**/*.js', ['scripts:toolkit']);
});


// development environment
gulp.task('dev', ['build'], function () {
	gulp.start('watch');
});


// default build task
gulp.task('default', function () {
	config.dev = false;
	gulp.start('build');
});
