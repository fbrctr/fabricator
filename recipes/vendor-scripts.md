# Including vendor scripts

Third party scripts like [jQuery](http://jquery.com) can be a helpful part of your toolkit. Here's how to modify the `gulpfile.js` to include these files:

1. Install the [streamqueue](https://www.npmjs.com/package/streamqueue) package: `$ npm install streamqueue --save-dev`
2. Create a `config.src.vendor` array and include vendor file paths.
3. Break the `scripts:toolkit` task into two streams - `toolkit()` and `vendor()` - then merge streams using `streamqueue()`.

```javascript
var browserify = require('browserify');
var concat = require('gulp-concat');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var streamqueue = require('streamqueue');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

var config = {
	dev: gutil.env.dev,
	src: {
		scripts: {
			fabricator: [
				'src/fabricator/scripts/prism.js',
				'src/fabricator/scripts/fabricator.js'
			],
			vendor: [
				'src/toolkit/assets/vendor/jquery/dist/jquery.js'
			],
			toolkit: './src/toolkit/assets/scripts/toolkit.js'
		}
	},
	dest: 'dist'
};

gulp.task('scripts:toolkit', function () {

	var toolkit = function () {
		return browserify(config.src.scripts.toolkit).bundle()
			.on('error', function (error) {
				gutil.log(gutil.colors.red(error));
				this.emit('end');
			})
			.pipe(source('toolkit.js'));
	};

	var vendor = function () {
		return gulp.src(config.src.scripts.vendor)
			.pipe(concat('vendor.js'));
	};

	return streamqueue({ objectMode: true }, vendor(), toolkit())
		.pipe(streamify(concat('toolkit.js')))
		.pipe(gulpif(!config.dev, streamify(uglify())))
		.pipe(gulp.dest(config.dest + '/toolkit/scripts'));

});

```

**Optional:** Check out the [Bower recipe](https://github.com/resource/fabricator/blob/master/recipes/bower.md) for info on using Bower as your client-side dependecny manager.
