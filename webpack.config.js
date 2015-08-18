var path    = require('path'),
	webpack = require('webpack'),
	lodash  = require('lodash');

module.exports = function(fabricatorConfig) {

	"use strict";

	var config = {
		entry: createWebpackConfigEntry(fabricatorConfig),
		output: {
			path: path.resolve(__dirname, fabricatorConfig.paths.dest, 'assets'),
			filename: '[name].js'
		},
		module: {
			loaders: [
				{
					test: /\.js$/,
					exclude: /(node_modules|prism\.js|materialize\.js)/,
					loaders: ['babel-loader']
				}
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
				$: 'jQuery',
				jQuery: 'jQuery'
			})
		],
		cache: {}
	};

	if (!fabricatorConfig.dev) { config.plugins.push(new webpack.optimize.UglifyJsPlugin()); }

	return config;

	function createWebpackConfigEntry(fabricatorConfig) {
		return lodash.set(
			lodash.mapKeys(fabricatorConfig.paths.toolkit.scripts,
				function (value, key) { return 'toolkit/scripts/' + key; }),
			'fabricator/scripts/f', fabricatorConfig.paths.fabricator.scripts
		);
	}
};
