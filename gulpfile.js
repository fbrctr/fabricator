'use strict';

// modules /////////////////////////////////////////////////////////////////////////////////////////////////////////////

var assemble    = require('fabricator-assemble'),
	browserSync = require('browser-sync'),
	csso        = require('gulp-csso'),
	del         = require('del'),
	fs          = require('fs'),
	gulp        = require('gulp'),
	gutil       = require('gulp-util'),
	gulpif      = require('gulp-if'),
	imagemin    = require('gulp-imagemin'),
	lodash      = require('lodash'),
	minimist    = require('minimist'),
	prefix      = require('gulp-autoprefixer'),
	rename      = require('gulp-rename'),
	reload      = browserSync.reload,
	replace     = require('gulp-replace-task'),
	runSequence = require('run-sequence'),
	sass        = require('gulp-sass'),
	sourcemaps  = require('gulp-sourcemaps'),
	webpack     = require('webpack');


// configuration ///////////////////////////////////////////////////////////////////////////////////////////////////////

var args   = minimist(process.argv.slice(2));
var config = lodash.merge({}, require('./fabricatorConfig.json'), args.config ? require(args.config) : {});
config.dev = gutil.env.dev;
config.buildConfig = args.buildConfig || './configs/fabricator.json';
config.data.push(config.package);

setupPaths();
setupPages();
setupBuildConfig(true);
setupBuildConfigInfo(true);

function setupPaths() {
	config.src = {
		"fabricator": {
			"scripts": "./src/assets/fabricator/scripts/fabricator.js",
			"styles" : "./src/assets/fabricator/styles/fabricator.scss"
		},
		"toolkit": {
			"scripts": config.scripts,
			"styles" : config.styles,
			"images" : lodash.map(config.images, function (src) {
				return src.replace('%s', config.buildConfig.split('/').pop(-1).slice(0, -5)); })
		}
	};
	config.watch = {
		"fabricator": {
			"styles" : "./src/assets/fabricator/styles/**/*.scss"
		},
		"toolkit": {
			"styles" : config.watchStyles
		}
	};
	config.dest = "dist";
}

/**
 * Pages are included into the views, but when using fabricator as a builder, the calling project
 * will set the pages sources. So if, then we exclude our own pages, and include the ones provided.
 * REMARK: Will be run before the actual assemble, as for watchers.
 */
function setupPages() {
	if (config.pages) {
		config.views.push('!./src/views/pages{,/**}');
		config.views = lodash.union(config.views, config.pages);
	}
}

/**
 * A buildConfig file is used to add data and fill in placeholders, for example in sass files.
 * If a buildConfig argument is given to the script, we'll use that, otherwise we'll use ours.
 * REMARK: Will be run before the actual assemble, as for watchers.
 */
function setupBuildConfig(firstTime) {
	delete require.cache[require.resolve(config.buildConfig)];  // This changes by the user!
	fs.writeFileSync('./buildConfig.json', JSON.stringify(require(config.buildConfig)));
	if (firstTime) { config.data.push('./buildConfig.json'); }
}

/**
 * Besides the use of buildConfig, it's possible to list info about these configurations on a
 * separate page. When buildConfigInfo is filled into the config file, we'll add this page.
 * REMARK: Will be run before the actual assemble, as for watchers.
 */
function setupBuildConfigInfo(firstTime) {
	if (firstTime) { config.views.push((config.buildConfigInfo ? '' : '!') + './src/views/configuration.html'); }
	if (config.buildConfigInfo) {
		delete  require.cache[require.resolve(config.buildConfigInfo)];  // This changes by the user!
		fs.writeFileSync('./buildConfigInfo.json', JSON.stringify(require(config.buildConfigInfo)));
		if (firstTime) { config.data.push('./buildConfigInfo.json'); }
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// webpack
var webpackConfig = require('./webpack.config')(config);
var webpackCompiler = webpack(webpackConfig);


// clean
gulp.task('clean', function (cb) {
	del([config.dest], cb);
});


// styles
gulp.task('styles:fabricator', function () {
	gulp.src(config.src.fabricator.styles)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.dest + '/assets/fabricator/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles:toolkit', function () {
	gulp.src(config.src.toolkit.styles)
		.pipe(sourcemaps.init())
		.pipe(replace({patterns: [{json: createStyleReplacementsFromConfig()}], usePrefix: false}))
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.dest + '/assets/toolkit/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);

function createStyleReplacementsFromConfig() {
	var replacements = {};
	fillReplacementsWithOwn(replacements, require(config.buildConfig));
	return replacements;

	function fillReplacementsWithOwn(replacements, data) {
		lodash.forOwn(data, function (value, key) {
			if (lodash.isObject(value)) { fillReplacementsWithOwn(replacements, value); }
			else { replacements['/* ' + key + ' */'] = key + ': ' + value + ' !default;'; }
		});
	}
}


// scripts
gulp.task('scripts', function (done) {
	webpackCompiler.run(function (error, result) {
		if (error) {
			gutil.log(gutil.colors.red(error));
		}
		result = result.toJson();
		if (result.errors.length) {
			result.errors.forEach(function (error) {
				gutil.log(gutil.colors.red(error));
			});
		}
		done();
	});
});


// images
gulp.task('images', ['favicon'], function () {
	return gulp.src(config.src.toolkit.images)
		.pipe(imagemin())
		.pipe(gulp.dest(config.dest + '/assets/toolkit/images'));
});

gulp.task('favicon', function () {
	return gulp.src('./src/favicon.ico')
		.pipe(gulp.dest(config.dest));
});


// assemble
gulp.task('assemble', function (done) {
	setupBuildConfigInfo(false);
	assemble({
		logErrors: config.dev,
		views    : config.views,
		materials: config.materials,
		data     : config.data
	});
	done();
});


// buildConfigChanged
gulp.task('buildConfigChanged', function () {
	setupBuildConfig(false);
	runSequence(['styles:toolkit', 'assemble']);
});


// server
gulp.task('serve', function () {

	browserSync({
		server: {
			baseDir: config.dest
		},
		notify: false,
		logPrefix: 'FABRICATOR'
	});

	/**
	 * Because webpackCompiler.watch() isn't being used
	 * manually remove the changed file path from the cache
	 */
	function webpackCache(e) {
		var keys = Object.keys(webpackConfig.cache);
		var key, matchedKey;
		for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			key = keys[keyIndex];
			if (key.indexOf(e.path) !== -1) {
				matchedKey = key;
				break;
			}
		}
		if (matchedKey) {
			delete webpackConfig.cache[matchedKey];
		}
	}

	gulp.task('assemble:watch', ['assemble'], reload);
	gulp.watch(constructAssembleSourcesToWatch(), ['assemble:watch']);

	gulp.task('styles:fabricator:watch', ['styles:fabricator']);
	gulp.watch(config.watch.fabricator.styles, ['styles:fabricator:watch']);

	gulp.task('styles:toolkit:watch', ['styles:toolkit']);
	gulp.watch(config.watch.toolkit.styles, ['styles:toolkit:watch']);

	gulp.task('scripts:watch', ['scripts'], reload);
	gulp.watch(lodash.union(config.src.fabricator.scripts, config.src.toolkit.scripts), ['scripts:watch'])
		.on('change', webpackCache);

	gulp.task('images:watch', ['images'], reload);
	gulp.watch(config.src.toolkit.images, ['images:watch']);

	gulp.task('buildConfig:watch', ['buildConfigChanged'], reload);
	gulp.watch(config.buildConfig, ['buildConfig:watch']);

	function constructAssembleSourcesToWatch() {
		if (args.config) {
			// Or we use fabricator from another project.
			var assembleSources = [];
			if (args.config.package)         { assembleSources.push(config.package); }
			if (args.config.views)           { assembleSources.push(config.views); }
			if (args.config.pages)           { assembleSources.push(config.pages); }
			if (args.config.materials)       { assembleSources.push(config.materials); }
			if (args.config.data)            { assembleSources.push(config.data); }
			if (args.config.buildConfigInfo) { assembleSources.push(args.config.buildConfigInfo); }
			return assembleSources;
		} else {
			// Or we use fabricator on itself.
			return ['src/**/*.{html,md,json,yml}'];
		}
	}
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
