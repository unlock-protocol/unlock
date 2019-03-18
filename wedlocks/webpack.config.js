const path = require('path')

const SRC_DIR = path.resolve(__dirname, 'src')
const OUT_DIR = path.resolve(__dirname, 'build')

const config = {
  mode: 'production',
  entry: {
    handler: path.resolve(SRC_DIR, 'handler.js')
  },
  // aws-sdk is already available in the Node.js Lambda environment
  // so it should not be included in function bundles
  externals: ['aws-sdk'],
  output: {
    path: OUT_DIR,
    filename: '[name].js',
    libraryTarget: 'umd'
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
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}

module.exports = config
