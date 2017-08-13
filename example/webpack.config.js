const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  target: 'web',
  cache: true,
  node: {
    fs: 'empty'
  },

  entry: {
    'app': [
      './shared/index.jsx'
    ]
  },

  output: {
    path: __dirname + "/build/js",
    filename: "bundle.js"
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],

  devtool: 'inline-source-map',

};

// Check if build is running in dev mode
if (process.env.NODE_ENV === "dev") {
  config.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      templateContent: '<html><body><main></main></body></html>',
      inject: true
    })
  );
  config.devServer = {
    contentBase: './tmp',
    historyApiFallback: true
  };
}

// Check if build is running in production mode
if (process.env.NODE_ENV === "production") {
  config.devtool = ""; // No sourcemap for production
  config.output = {
    path: __dirname + "/dist/js",
    filename: 'bundle.js'
  };
  config.plugins = [
    new UglifyJSPlugin(),
  ];
}

module.exports = config;
