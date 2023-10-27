const dotenv = require('dotenv')
const path = require('path')
const { withSentryConfig } = require('@sentry/nextjs')
const withTM = require('next-transpile-modules')(['@tw-classed/react'])

const unlockEnv = process.env.NEXT_PUBLIC_UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredEnvs = {
  unlockEnv,
  base64WedlocksPublicKey: process.env.NEXT_PUBLIC_BASE64_WEDLOCKS_PUBLIC_KEY,
  stripeApiKey:
    process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB',
  ethPassApiKey:
    process.env.NEXT_PUBLIC_ETHPASS_KEY ||
    'sk_live_UqGWk8FCZu2eamzAwegRTjlhS0wd1feu',
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
  productionBrowserSourceMaps: true,
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    // this includes files from the monorepo base directory up
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
}

module.exports = withSentryConfig(withTM(config))
