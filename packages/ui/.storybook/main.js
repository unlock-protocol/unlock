const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  stories: ['../lib/**/*.stories.mdx', '../lib/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  staticDirs: ['../public'],
  framework: '@storybook/react',
  webpackFinal: async (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin(),
    ]

    config.module.rules = [
      ...config.module.rules.map((rule) => {
        if (/svg/.test(rule.test)) {
          // Silence the Storybook loaders for SVG files
          return { ...rule, exclude: /\.svg$/i }
        }
        return rule
      }),
      // Add your custom SVG loader
      {
        test: /\.svg$/i,
        use: ['@svgr/webpack'],
      },
    ]

    return config
  },
}
