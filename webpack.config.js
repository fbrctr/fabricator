var path = require('path');
var webpack = require('webpack');

module.exports = function(fabricatorConfig) {

	var config = {
		entry: {
			toolkit: path.resolve(__dirname, fabricatorConfig.src.scripts.toolkit)
		},
		output: {
			path: path.resolve(__dirname, fabricatorConfig.dest, 'assets/toolkit/scripts'),
			filename: 'toolkit.js'
		},
		plugins: []
	};

	if (!fabricatorConfig.dev) {
		config.plugins.push(
			new webpack.optimize.UglifyJsPlugin()
		);
	}
	
	return config;

};
