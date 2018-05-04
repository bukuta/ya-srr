const debug = require('debug')('soc-cli:bab-config');

let babelLoaderConfig = {
  loader: require.resolve('babel-loader'),
  options: {
    cacheDirectory: true,
    plugins: [
      //require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-syntax-dynamic-import'),
      require.resolve('babel-plugin-transform-function-bind'),
      //require.resolve('babel-plugin-transform-decorators'),

      require.resolve('babel-plugin-transform-vue-jsx'),
      [
        require.resolve('babel-plugin-transform-runtime'),
        {
          helpers: true,
          polyfill: false,
          // we polyfill needed features in src/normalize.js????
          regenerator: true,
        },
      ],
      [
        //require.resolve('@babel/plugin-proposal-decorators'),
        //require.resolve('babel-plugin-transform-decorators'),
        require.resolve('babel-plugin-transform-decorators-legacy'),
        //'@babel/plugin-proposal-decorators',
        {
          legacy: true,
        },
      ],
      [
        require.resolve('babel-plugin-transform-object-rest-spread'),
        {
          useBuiltIns: true // we polyfill Object.assign in src/normalize.js
        },
      ],
      //[
        ////'@babel/plugin-proposal-object-rest-spread',
        //require.resolve('@babel/plugin-proposal-object-rest-spread'),
        //{
          //useBuiltIns: true // we polyfill Object.assign in src/normalize.js
        //},
      //],
    ],
    presets: [
      [require.resolve('babel-preset-env'), {
      //[require.resolve('@babel/preset-env'), {
        modules: 'commonjs',
        targets: {
          ie9: true,
        },
        uglify: false,
      }]
    ]
  }
};

module.exports = babelLoaderConfig;
