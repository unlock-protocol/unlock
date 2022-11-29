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
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: true,
  },
}

module.exports = withSentryConfig(config)
