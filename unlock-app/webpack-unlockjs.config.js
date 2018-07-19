const path = require('path')
const webpack = require('webpack')

let url = 'https://unlock-protocol.com'
if (process.env.TARGET == 'staging') {
  url = 'https://staging.unlock-protocol.com'
}

module.exports = {
  entry: './src/unlock.js',
  output: {
    filename: 'unlock.js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new webpack.DefinePlugin({
      UNLOCK_URL: JSON.stringify(url),
    }),
  ],
}