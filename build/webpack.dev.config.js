const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
    new CopyPlugin({
      patterns: [
        {
          from: '_raw/react-devtools.js',
          to: 'react-devtools.js',
        },
      ],
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
