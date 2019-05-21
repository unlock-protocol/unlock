const path = require('path')
const webpack = require('webpack')

const SRC_DIR = path.resolve(__dirname, 'src')
const OUT_DIR = path.resolve(__dirname, 'build')

// This is important because this will actually make deploys fail if we are missing env vars
require('./config')

module.exports = {
  mode: 'production',
  entry: {
    handler: path.resolve(SRC_DIR, 'handler.js'),
  },
  // aws-sdk is already available in the Node.js Lambda environment
  // so it should not be included in function bundles
  externals: ['aws-sdk'],
  output: {
    path: OUT_DIR,
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SMTP_HOST': JSON.stringify(process.env.SMTP_HOST),
      'process.env.SMTP_PORT': JSON.stringify(process.env.SMTP_PORT),
      'process.env.SMTP_USERNAME': JSON.stringify(process.env.SMTP_USERNAME),
      'process.env.SMTP_PASSWORD': JSON.stringify(process.env.SMTP_PASSWORD),
      'process.env.SMTP_FROM_ADDRESS': JSON.stringify(
        process.env.SMTP_FROM_ADDRESS
      ),
      'process.env.BASE64_WEDLOCKS_PRIVATE_KEY': JSON.stringify(
        process.env.BASE64_WEDLOCKS_PRIVATE_KEY
      ),
    }),
  ],
}
