const path = require('path')

module.exports = async ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [require.resolve('babel-preset-react-app')],
    },
  })
  config.module.rules.push({
    test: /\.md$/,
    use: 'raw-loader',
  })
  config.module.rules.push({
    test: /blog\.index/,
    use: 'raw-loader',
  })

  config.resolve.extensions.push('.ts', '.tsx')

  return config
}
