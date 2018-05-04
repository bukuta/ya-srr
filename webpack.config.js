'use strict'
const path = require('path');
const webpack = require('webpack')
const debug = require('debug')('soc-cli:dev-client');

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, 'lib');


let babelLoaderConfig =require('./a.js');

process.traceDeprecation = true

let exportConfig = {
  entry: {
    'index': path.resolve(projectRoot, './src/index.js'),
  },

  output: {
    path: outDir,
    filename: '[name].js',
    publicPath: '/',
    pathinfo: true
  },

  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false
  },

  resolve: {
    extensions: ['.js', '.vue', '.css', '.json'],
    alias: { },
    modules: [
      'node_modules',
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|es6)$/,
        use: babelLoaderConfig,
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: require.resolve('html-loader'),
      },
      {
        test: /\.svg$/,
        use: require.resolve('url-loader')
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options:{
              //attrs:{
                //'path': '[path][name].[ext]',
              //}
            }
          },
          {
            loader: require.resolve('css-loader')
          },
          {
            loader: require.resolve('postcss-loader'),
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: require.resolve('style-loader'),
            options:{
              attrs:{
                'path': '[path][name].[ext]',
              }
            }
          },
          {
            loader: require.resolve('css-loader')
          },
          {
            loader: require.resolve('postcss-loader'),
          },
          {
            loader: require.resolve('less-loader')
          },
        ],
      },
      {
        test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
        use: [
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'fonts/[name].[hash:7].[ext]'
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
          loader: require.resolve('url-loader'),
          exclude: /favicon\.png$/,
          options: {
            limit: 8192,
          },
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool:'sourcemap',
  target: 'web',
  mode: 'development',
  //mode: 'production',
}


module.exports = exportConfig

