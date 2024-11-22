const webpack = require('webpack');
const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Dotenv = require('dotenv-webpack');

const config = {
  mode: 'production',
  devtool: false,
  cache: {
    type: 'filesystem',
  },
  performance: {
    maxEntrypointSize: 2500000,
    maxAssetSize: 2500000,
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env.BUILD_ENV': JSON.stringify('PRO'),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new Dotenv({
      path: '.env.pro',
    }),
  ],
  resolve: {
    fallback: {
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      buffer: require.resolve('buffer'),
      url: require.resolve('url/'),
      vm: require.resolve('vm-browserify'),
    },
  },
};

module.exports = config;
