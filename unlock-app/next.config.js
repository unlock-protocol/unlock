const dotenv = require('dotenv')
const path = require('path')

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
  if (unlockEnv !== 'dev' && !value) {
    throw new Error(`${key} is missing in the environment. Please export.`)
  } else {
    console.error(`${key} is missing in the environment.`)
  }
}

module.exports = {}
