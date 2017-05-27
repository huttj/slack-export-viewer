const webpack = require('webpack');
const path = require('path');

module.exports = {
  // devtool: 'eval',
  entry: [
    // activate HMR for React
    'webpack-hot-middleware/client',
    './client/js/index',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  plugins: [
    // OccurenceOrderPlugin is needed for webpack 1.x only
    // new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    loaders: [{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ }]
  }
};