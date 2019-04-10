const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [require.resolve('babel-preset-react-app')],
    },
  })

  config.resolve.extensions.push('.ts', '.tsx')

  config.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      async: false,
      checkSyntacticErrors: true,
      formatter: require('react-dev-utils/typescriptFormatter'),
    })
  )

  return config
}
