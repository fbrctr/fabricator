'use strict';

// modules
var assemble = require('fabricator-assemble');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var csso = require('gulp-csso');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var imagemin = require('gulp-imagemin');
var prefix = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');


// configuration
var config = {
	dev: gutil.env.dev,
	src: {
		scripts: {
			fabricator: [
				'./src/assets/fabricator/scripts/prism.js',
				'./src/assets/fabricator/scripts/fabricator.js'
			],
			toolkit: './src/assets/toolkit/scripts/toolkit.js'
		},
		styles: {
			fabricator: './src/assets/fabricator/styles/fabricator.scss',
			toolkit: './src/assets/toolkit/styles/toolkit.scss'
		},
		images: 'src/assets/toolkit/images/**/*',
		views: './src/toolkit/views/*.html',
		materials: [
			'components',
			'structures',
			'templates',
			'documentation'
		]
	},
	dest: './dist'
};


// clean
gulp.task('clean', function (cb) {
	del([config.dest], cb);
});


// styles
gulp.task('styles:fabricator', function () {
	return gulp.src(config.src.styles.fabricator)
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(gulp.dest(config.dest + '/assets/fabricator/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles:toolkit', function () {
	return gulp.src(config.src.styles.toolkit)
		.pipe(sass({
			errLogToConsole: true
		}))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(gulp.dest(config.dest + '/assets/toolkit/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);


// scripts
gulp.task('scripts:fabricator', function () {
	return gulp.src(config.src.scripts.fabricator)
		.pipe(concat('f.js'))
		.pipe(gulpif(!config.dev, uglify()))
		.pipe(gulp.dest(config.dest + '/assets/fabricator/scripts'));
});

gulp.task('scripts:toolkit', function () {
	return browserify(config.src.scripts.toolkit)
		.bundle()
		.on('error', function (error) {
			gutil.log(gutil.colors.red(error));
			this.emit('end');
		})
		.pipe(source('toolkit.js'))
		.pipe(gulpif(!config.dev, streamify(uglify())))
		.pipe(gulp.dest(config.dest + '/assets/toolkit/scripts'));
});

gulp.task('scripts', ['scripts:fabricator', 'scripts:toolkit']);


// images
gulp.task('images', ['favicon'], function () {
	return gulp.src(config.src.images)
		.pipe(imagemin())
		.pipe(gulp.dest(config.dest + '/assets/toolkit/images'));
});

gulp.task('favicon', function () {
	return gulp.src('./src/favicon.ico')
		.pipe(gulp.dest(config.dest));
});


// assemble
gulp.task('assemble', function (done) {
	assemble();
	done();
});


// server
gulp.task('serve', function () {

	var reload = browserSync.reload;

	browserSync({
		server: {
			baseDir: config.dest
		},
		notify: false,
		logPrefix: 'FABRICATOR'
	});

	gulp.watch('src/**/*.{html,md,json,yml}', ['assemble']).on('change', reload);
	gulp.watch('src/assets/fabricator/styles/**/*.scss', ['styles:fabricator']);
	gulp.watch('src/assets/toolkit/styles/**/*.scss', ['styles:toolkit']);
	gulp.watch('src/assets/fabricator/scripts/**/*.js', ['scripts:fabricator']).on('change', reload);
	gulp.watch('src/assets/toolkit/scripts/**/*.js', ['scripts:toolkit']).on('change', reload);
	gulp.watch(config.src.images, ['images']).on('change', reload);
});


// default build task
gulp.task('default', ['clean'], function () {

	// define build tasks
	var tasks = [
		'styles',
		'scripts',
		'images',
		'assemble'
	];

	// run build
	runSequence(tasks, function () {
		if (config.dev) {
			gulp.start('serve');
		}
	});

});
