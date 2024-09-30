import dotenv from 'dotenv'
import path from 'path'

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

const configPath = path.resolve(
  __dirname,
  '..', //
  '..',
  '..',
  `.env.${unlockEnv}.local`
)

if (process.env.NODE_ENV !== 'test') {
  console.log(`Loading config from ${configPath}`)
}

try {
  dotenv.config({
    path: configPath,
  })
} catch (error) {
  console.error('Failed to load config', error)
}

const requiredEnvVars = [
  'STRIPE_SECRET',
  'PURCHASER_CREDENTIALS',
  'STORAGE_ENDPOINT',
  'STORAGE_ACCESS_KEY_ID',
  'STORAGE_SECRET_ACCESS_KEY',
  'RECAPTCHA_SECRET',
]

requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar] === undefined) {
    if (['production'].indexOf(process.env.NODE_ENV || '') > -1) {
      throw new Error(`Missing required environment variable ${envVar}`)
    }
  }
})
