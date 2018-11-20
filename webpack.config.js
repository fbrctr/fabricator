const path = require('path');

/**
 * Define loaders
 * @return {Array}
 */
function getRules() {
  return [
    {
      test: /(\.js)/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
      },
    },
    {
      test: /(\.jpg|\.png)$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      ],
    },
    {
      test: /\.json/,
      loader: 'json-loader',
    },
  ];
}

module.exports = config => {
  return {
    mode: config.dev ? 'development' : 'production',
    entry: {
      'fabricator/scripts/f': config.scripts.fabricator.src,
      'toolkit/scripts/toolkit': config.scripts.toolkit.src,
    },
    output: {
      path: path.resolve(__dirname, config.dest, 'assets'),
      filename: '[name].js',
      pathinfo: config.dev,
    },
    devtool: config.dev ? 'cheap-module-eval-source-map' : false,
    module: {
      rules: getRules(),
    },
  };
};
