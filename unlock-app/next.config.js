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
  stripeApiKey:
    process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_BHXKmScocCfrQ1oW8HTmnVrB',
  ethPassApiKey: 'sk_live_h0pHRAZ2E6WTkNIrXvEzbEQN39Ftrp1p',
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

/** @type {import('next').NextConfig} */
const config = {
  productionBrowserSourceMaps: true,
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: true,
  },
  transpilePackages: ['@tw-classed/react'],
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  experimental: {
    // this includes files from the monorepo base directory up
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  async redirects() {
    return [
      // redirect to locks page
      {
        source: '/dashboard',
        destination: '/locks',
        permanent: true,
      },
      // redirect to checkout page and preserve path
      {
        source: '/alpha/checkout/:path*',
        destination: '/checkout/:path*',
        permanent: true,
      },
      {
        source: '/legacy/checkout/:path*',
        destination: '/checkout/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = withSentryConfig(config)
