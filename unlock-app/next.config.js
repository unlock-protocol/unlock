const dotenv = require('dotenv')
const path = require('path')
const { withSentryConfig } = require('@sentry/nextjs')

const unlockEnv = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredEnvs = {
  unlockEnv,
  base64WedlocksPublicKey: process.env.NEXT_PUBLIC_BASE64_WEDLOCKS_PUBLIC_KEY,
  stripeApiKey: process.env.NEXT_PUBLIC_STRIPE_KEY,
}

for (const [key, value] of Object.entries(requiredEnvs)) {
  if (value) {
    continue
  }
  if (unlockEnv !== 'dev') {
    throw new Error(`${key} is missing in the environment. Please export.`)
  } else {
    console.error(`${key} is missing in the environment.`)
  }
}

const config = {
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
  },
}

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = withSentryConfig(config, sentryWebpackPluginOptions)
