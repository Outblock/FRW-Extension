const webpackMerge = require('webpack-merge');
const commonConfig = require('./build/webpack.common.config');
const webpack = require('webpack');
const path = require('path');

const configs = {
  dev: require('./build/webpack.dev.config'),
  pro: require('./build/webpack.pro.config'),
  none: {
    mode: 'development',
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
        'process.env.BUILD_ENV': JSON.stringify('DEV'),
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    resolve: {
      fallback: {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        buffer: require.resolve('buffer'),
        url: require.resolve('url/'),
      },
    },
  },
};

const config = (env) => {
  if (env.config) {
    return webpackMerge.merge(commonConfig, configs[env.config]);
  }

  return commonConfig;
};

module.exports = config;
