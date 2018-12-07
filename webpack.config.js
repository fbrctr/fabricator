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

module.exports = ({
  dev,
  scripts: {
    fabricator: { src: fabSrc },
    toolkit: { src: scriptSrc },
  },
  dest,
}) => {
  return {
    mode: dev ? 'development' : 'production',
    entry: {
      'fabricator/scripts/f': fabSrc,
      'toolkit/scripts/toolkit': scriptSrc,
    },
    output: {
      path: path.resolve(__dirname, dest, 'assets'),
      filename: '[name].js',
      pathinfo: dev,
    },
    devtool: dev ? 'cheap-module-eval-source-map' : false,
    module: {
      rules: getRules(),
    },
  };
};
