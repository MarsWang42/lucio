var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {

  target: 'web',

  cache: true,

  node: {
    fs: 'empty'
  },

  entry: ['webpack/hot/dev-server', './src/index.jsx'],

  output: {
    path: path.join(__dirname, 'tmp'),
    publicPath: '',
    filename: '[name].js'
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel']
      }
    ]
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      templateContent: '<html><body><main></main></body></html>',
      inject: true
    }),
    new webpack.NoErrorsPlugin()
  ],

  debug: true,

  devtool: 'inline-source-map',

  devServer: {
    contentBase: './tmp',
    historyApiFallback: true
  }
};
