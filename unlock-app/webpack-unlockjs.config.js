const path = require('path')
const webpack = require('webpack')

let url = 'https://unlock-protocol.com'
if (process.env.TARGET == 'staging') {
  url = 'https://staging.unlock-protocol.com'
} else if (process.env.TARGET == 'dev') {
  url = 'http://0.0.0.0:3000'
}

module.exports = {
  entry: './src/unlock.js',
  output: {
    filename: 'unlock.js',
    path: path.resolve(__dirname, 'build'),
  },
  devServer: {
    compress: true,
    port: process.env.UNLOCKJS_PORT || 9999 ,
  },
  plugins: [
    new webpack.DefinePlugin({
      UNLOCK_URL: JSON.stringify(url),
    }),
  ],
}