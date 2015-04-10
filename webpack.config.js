var path = require('path');
var webpack = require('webpack');

module.exports = function(fabricatorConfig) {

	var config = {
		entry: {
			'fabricator/scripts/f': fabricatorConfig.src.scripts.fabricator,
			'toolkit/scripts/toolkit': fabricatorConfig.src.scripts.toolkit,
		},
		output: {
			path: path.resolve(__dirname, fabricatorConfig.dest, 'assets'),
			filename: '[name].js'
		},
		plugins: []
	};

	// If "vendor" scripts are found, assume they aren't commonjs compatible
	// and just load them as normal scripts
	// See: https://github.com/webpack/docs/wiki/shimming-modules#script-loader
	var vendor = fabricatorConfig.src.scripts.vendor;
	if (vendor) {
		config.entry['toolkit/scripts/vendor'] = vendor.map(function(src) {
			return 'script!' + src;
		});
	}

	if (!fabricatorConfig.dev) {
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin()
		);
	}
	
	return config;

};
