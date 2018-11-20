module.exports = function babelConfig(api) {
  api.cache.using(() => process.env.NODE_ENV === 'development');

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
        },
      ],
    ],
  };
};
