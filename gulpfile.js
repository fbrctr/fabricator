'use strict';

var assemble    = require('fabricator-assemble'),
	browserSync = require('browser-sync'),
	concat      = require('gulp-concat'),
	csso        = require('gulp-csso'),
	del         = require('del'),
	fs          = require('fs'),
	gulp        = require('gulp'),
	gutil       = require('gulp-util'),
	gulpif      = require('gulp-if'),
	imagemin    = require('gulp-imagemin'),
	lodash      = require('lodash'),
	merge       = require('merge2'),
	minimist    = require('minimist'),
	prefix      = require('gulp-autoprefixer'),
	rename      = require('gulp-rename'),
	reload      = browserSync.reload,
	replace     = require('gulp-replace-task'),
	runSequence = require('run-sequence'),
	sass        = require('gulp-sass'),
	sourcemaps  = require('gulp-sourcemaps'),
	uglify      = require('gulp-uglify'),
	webpack     = require('webpack');

var args            = minimist(process.argv.slice(2)),
	buildConfigFile = lodash.get(args, 'buildConfig', './configs/fabricator.json'),
	config          = createConfig(getProjectConfig(args), getFileName(buildConfigFile)),
	webpackConfig   = require('./webpack.config')(config),
	webpackCompiler = webpack(webpackConfig);

initializeBuild();

gulp.task('default', ['clean'], function () {
	runSequence(
		['styles', 'scripts', 'images', 'samples', 'assemble'],
		function () { if (config.dev) { gulp.start('serve'); } }
	);
});

gulp.task('clean', function (cb) { del([config.paths.dest], {force: true}, cb); });

gulp.task('styles:fabricator', function () {
	gulp.src(config.paths.fabricator.styles)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(gulpif(!config.dev, csso()))
		.pipe(rename('f.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.paths.dest + '/assets/fabricator/styles'))
		.pipe(gulpif(config.dev, reload({stream:true})));
});

gulp.task('styles:toolkit:fonts', function () {
	return gulp.src(config.paths.toolkit.fonts)
		.pipe(gulp.dest(config.paths.dest + '/assets/toolkit/fonts'));
});

gulp.task('styles:toolkit', ['styles:toolkit:fonts'], function () {
	var styleReplacements = createStyleReplacementsFromConfig();

	return merge(lodash.map(lodash.pairs(config.paths.toolkit.styles), createToolkitStyleStream))
		.pipe(gulpif(config.dev, reload({stream: true})));

	function createToolkitStyleStream(namedSrc) {
		return gulp.src(namedSrc[1])
			.pipe(sourcemaps.init())
			.pipe(replace({patterns: [{json: styleReplacements}], usePrefix: false}))
			.pipe(sass().on('error', sass.logError))
			.pipe(prefix('last 1 version'))
			.pipe(gulpif(!config.dev, csso()))
			.pipe(concat(namedSrc[0] + '.css'))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(config.paths.dest + '/assets/toolkit/styles'));
	}
});

gulp.task('styles', ['styles:fabricator', 'styles:toolkit']);

gulp.task('scripts', function (done) {
	if (config.useWebpack) {
		webpackCompiler.run(function (error, result) {
			if (error) { logError(error); }

			result = result.toJson();
			if (result.errors.length) { result.errors.forEach(logError); }

			done();
		});
	} else {
		return merge(
			createScriptStream(constructFabricatorScriptSrc(), '/assets/fabricator/scripts', 'f.js'),
			createToolkitScriptStreams(config.paths.toolkit.scripts, '/assets/toolkit/scripts')
		);
	}

	function constructFabricatorScriptSrc() {
		return lodash.union(['./src/assets/fabricator/scripts/prism.js'], config.paths.fabricator.scripts);
	}

	function createToolkitScriptStreams(src, dest) {
		return lodash.map(lodash.pairs(src), function (namedSrc) {
			return createScriptStream(namedSrc[1], dest, namedSrc[0] + '.js');
		});
	}

	function createScriptStream(src, dest, fileName) {
		return gulp.src(src)
			.pipe(gulpif(!config.dev, uglify()))
			.pipe(concat(fileName))
			.pipe(gulp.dest(config.paths.dest + dest));
	}

	function logError(error) { gutil.log(gutil.colors.red(error)); }
});

gulp.task('images:favicon', function () {
	return gulp.src('./src/favicon.ico')
		.pipe(gulp.dest(config.paths.dest));
});

gulp.task('images', ['images:favicon'], function () {
	return gulp.src(config.paths.toolkit.images)
		//.pipe(imagemin())  >> svg files and ico files didn't came with it.
		.pipe(gulp.dest(config.paths.dest + '/assets/toolkit/images'));
});

gulp.task('samples', function () {
	return gulp.src(config.paths.samples)
		.pipe(gulp.dest(config.paths.dest + '/assets/samples'));
});

gulp.task('assemble', function (done) {
	initializeBuildConfigInfo();
	assemble({
		logErrors: config.dev,
		views    : config.paths.views,
		materials: config.paths.materials,
		data     : config.paths.data,
		docs     : config.paths.docs,
		dest     : config.paths.dest
	});
	done();
});

gulp.task('buildConfigChanged', function () {
	initializeBuildConfig(false);
	runSequence(['styles:toolkit', 'assemble']);
});

gulp.task('serve', function () {

	browserSync({
		server: {baseDir: config.paths.dest},
		notify: false,
		logPrefix: 'FABRICATOR'
	});

	// Because webpackCompiler.watch() isn't being used
	// manually remove the changed file path from the cache
	function webpackCache(e) {
		var keys = Object.keys(webpackConfig.cache);
		var key, matchedKey;
		for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			key = keys[keyIndex];
			if (key.indexOf(e.path) !== -1) { matchedKey = key; break; }
		}
		if (matchedKey) { delete webpackConfig.cache[matchedKey]; }
	}

	gulp.task('assemble:watch', ['assemble'], reload);
	gulp.watch(constructAssembleSourcesToWatch(), ['assemble:watch']);

	gulp.task('styles:fabricator:watch', ['styles:fabricator']);
	gulp.watch(createPathsForWatchingStyles(config.paths.fabricator.styles), ['styles:fabricator:watch']);

	gulp.task('styles:toolkit:watch', ['styles:toolkit']);
	gulp.watch(constructToolkitStyleSourcesToWatch(), ['styles:toolkit:watch']);

	gulp.task('scripts:watch', ['scripts'], reload);
	gulp.watch(constructScriptSourcesToWatch(), ['scripts:watch'])
		.on('change', webpackCache);

	gulp.task('images:watch', ['images'], reload);
	gulp.watch(config.paths.toolkit.images, ['images:watch']);

	gulp.task('samples:watch', ['samples'], reload);
	gulp.watch(config.paths.samples, ['samples:watch']);

	gulp.task('buildConfig:watch', ['buildConfigChanged'], reload);
	gulp.watch(buildConfigFile, ['buildConfig:watch']);
});


// FABRICATORCONFIG.JSON ///////////////////////////////////////////////////////////////////////////////////////////////
//
// The 'required' ones, which have the following defaults:
//
//	"useWebpack": true  // Webpack doesn't work well with bower modules!
//	"package"   : "./package.json",
//	"views"     : ["./src/views/**/*", "!./src/views/+(layouts)/**"],
//	"materials" : ["./src/materials/**/*"],
//	"data"      : ["./src/data/**/*.{json,yml}"],
//	"samples"   : ["./src/samples/**/*"],
//	"docs"      : ["./src/docs/**/*.md"],
//	"scripts"   : {  // Each prop will be a script file.
// 		"toolkit": ["./src/assets/toolkit/scripts/toolkit.js"]
// 	},
//	"styles"    : {  // Each prop will be a stylesheet file.
// 		"toolkit": ["./src/assets/toolkit/styles/toolkit.scss"]
// 	},
//	"fonts"     : ["./src/assets/toolkit/fonts/**/*"],
//	"images"    : ["./src/assets/toolkit/images/**/*"]
//
// The 'optional' ones:
//
//	"buildConfigInfo":  ''   // A file with buildConfigInfo.
//  "pages"          : ['']  // If you use your own pages (from another project).
//	"ngApp"          :  ''   // A js file which is the app for your toolkit, added to f.js.
//	"buildDest"      :  ''   // A custom folder to build production to, %s will be replaced by build name.
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function getProjectConfig(args) { return args.config ? require(args.config) : {}; }

function createConfig(projectFabricatorConfig, build) {
	var development = gutil.env.dev;
	var fabricatorConfig = lodash.merge({}, require('./fabricatorConfig.json'), projectFabricatorConfig);

	var config = {
		dev: development,
		useWebpack: fabricatorConfig.useWebpack,
		paths: {
			fabricator: {
				scripts: ['./src/assets/fabricator/scripts/fabricator.js'],
				styles: ['./src/assets/fabricator/styles/fabricator.scss']
			},
			toolkit: {
				scripts: fabricatorConfig.scripts,
				styles: fabricatorConfig.styles,
				images: createPathsForBuild(fabricatorConfig.images, build),
				fonts: fabricatorConfig.fonts
			},
			samples: fabricatorConfig.samples,
			views: createConfigViewsPaths(fabricatorConfig),
			materials: fabricatorConfig.materials,
			data: createConfigDataPaths(fabricatorConfig),
			docs: fabricatorConfig.docs,
			dest: createConfigDestPath(fabricatorConfig, build, development)
		}
	};

	var buildConfigInfoFile = lodash.get(fabricatorConfig, 'buildConfigInfo', '');
	if (buildConfigInfoFile !== '') { config.buildConfigInfoFile = buildConfigInfoFile; }

	var pages = lodash.get(fabricatorConfig, 'pages', []);
	if (lodash.size(pages) > 0) { config.paths.pages = fabricatorConfig.pages; }

	var ngAppFile = lodash.get(fabricatorConfig, 'ngApp', '');
	if (ngAppFile !== '') {
		config.ngAppFile = ngAppFile;
		config.paths.toolkit.scripts['toolkit-test-app'] = [ngAppFile];	}

	return config;
}

function createConfigViewsPaths(fabricatorConfig) {
	var projectPages = lodash.get(fabricatorConfig, 'pages', []);
	return lodash.union(
		fabricatorConfig.views,
		lodash.size(projectPages) > 0 ? ['!./src/views/pages{,/**}'] : [],
		projectPages,
		(lodash.has(fabricatorConfig, 'buildConfigInfo') ? '' : '!') + './src/views/configuration.html'
	);
}

function createConfigDataPaths(fabricatorConfig) {
	return lodash.union(
		[fabricatorConfig.package, './buildConfig.json'],
		lodash.has(fabricatorConfig, 'buildConfigInfo') ? ['./buildConfigInfo.json'] : []
	);
}

function createConfigDestPath(fabricatorConfig, build, development) {
	var buildDest = lodash.get(fabricatorConfig, 'buildDest', '');
	return (!development && buildDest !== '') ? createPathForBuild(buildDest, build) : 'dist';
}

function createPathsForBuild(paths, build) {
	return lodash.map(paths, function (path) { return createPathForBuild(path, build); })
}

function createPathForBuild(path, build) {
	return path.replace('%s', build);
}

function createPathsForWatchingStyles(paths) {
	return lodash.map(paths, function (path) {
		return createPathFromArrayOfStrings(lodash.dropRight(path.split('/'))) + '/**/*.scss';
	});
}

function createPathFromArrayOfStrings(strings) {
	return lodash.reduce(strings, function (result, piece) { return result + '/' + piece; });
}

function initializeBuild() {
	initializeBuildConfig();
	initializeBuildConfigInfo();
}

function initializeBuildConfig() {
	// A buildConfig file is used to add data and fill in placeholders, for example in sass files.
	// If a buildConfig argument is given to the script, we'll use that, otherwise we'll use ours.
	// REMARK: Will be run before the actual assemble, as for watchers.

	delete require.cache[require.resolve(buildConfigFile)];  // This changes by the user!
	fs.writeFileSync('./buildConfig.json', JSON.stringify(createBuildConfigData()));

	function createBuildConfigData() {
		var buildConfigData = lodash.chain(require(buildConfigFile))
			.set('toolkitScripts', lodash.keys(config.paths.toolkit.scripts))
			.set('toolkitStyles', lodash.keys(config.paths.toolkit.styles))
			.value();

		var ngAppFile = lodash.get(config, 'ngAppFile', '');
		if (ngAppFile !== '') { buildConfigData.ngAppName = getFileName(ngAppFile); }

		return buildConfigData;
	}
}

function initializeBuildConfigInfo() {
	// Besides the use of buildConfig, it's possible to list info about these configurations on a
	// separate page. When buildConfigInfo is filled into the config file, we'll add this page.
	// REMARK: Will be run before the actual assemble, as for watchers.

	var buildConfigInfoFile = lodash.get(config, 'buildConfigInfoFile', '');
	if (buildConfigInfoFile !== '') {
		delete require.cache[require.resolve(buildConfigInfoFile)];  // This changes by the user!
		fs.writeFileSync('./buildConfigInfo.json', JSON.stringify(require(buildConfigInfoFile)));
	}
}

function createStyleReplacementsFromConfig() {
	var replacements = {};
	fillReplacementsWithData(replacements, require(buildConfigFile));
	return replacements;

	function fillReplacementsWithData(replacements, data) {
		lodash.forOwn(data, function (value, key) {
			if (lodash.isObject(value)) { fillReplacementsWithData(replacements, value); }
			else { replacements['/* ' + key + ' */'] = key + ': ' + value + ' !default;'; }
		});
	}
}

function constructAssembleSourcesToWatch() {
	var buildConfigInfoFile = lodash.get(config, 'buildConfigInfoFile', '');

	return lodash.union(
		config.paths.views,
		config.paths.materials,
		lodash.get(config.paths, 'pages', []),
		config.paths.data,
		config.paths.docs,
		buildConfigInfoFile !== '' ? [buildConfigInfoFile] : []
	);
}

function constructToolkitStyleSourcesToWatch() {
	var stylesToWatch = [];
	lodash.forOwn(config.paths.toolkit.styles, function (src) {
		stylesToWatch = lodash.union(stylesToWatch, src); });
	return createPathsForWatchingStyles(stylesToWatch);
}

function constructScriptSourcesToWatch() {
	var scriptsToWatch = config.paths.fabricator.scripts;
	lodash.forOwn(config.paths.toolkit.scripts, function (src) {
		scriptsToWatch = lodash.union(scriptsToWatch, src); });
	return scriptsToWatch;
}

function getFileName(filePath) {
	return lodash.reduce(
		filePath.split('/').pop(-1).split('.').slice(0, -1),
		function (result, piece) { return result + '.' + piece; });
}
