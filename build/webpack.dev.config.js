const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

// for extension local test, can build each time
const config = {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  watch: true,
  cache: {
    type: 'filesystem',
  },
  watchOptions: {
    ignored: ['**/public', '**/node_modules'],
    followSymlinks: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify('DEV'),
    }),
    new Dotenv({
      path: '.env.dev',
    }),
  ],
  resolve: {
    fallback: {
      fs: false,
      vm: require.resolve('vm-browserify'),
    },
  },
};

module.exports = config;
