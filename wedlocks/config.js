/* eslint no-console: 0 */
// This needs to be written as ES5 because it is consumed by Webpack too to assess the config
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

// Remember to add mapping in webpack for all environment variables below
const requiredVariables = [
  'SMTP_HOST',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'BASE64_WEDLOCKS_PRIVATE_KEY',
]
requiredVariables.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Environment variable ${envVar} is required.`)
    if (['dev', 'test'].indexOf(unlockEnv) === -1) {
      process.exit(1)
    }
  }
})

let wedlocksPrivateKey
if (process.env.BASE64_WEDLOCKS_PRIVATE_KEY) {
  // This env variable is passed as base 64 to comply with the multiline reco by circleci:
  // https://circleci.com/docs/2.0/env-vars/#encoding-multi-line-environment-variables
  wedlocksPrivateKey = Buffer.from(
    process.env.BASE64_WEDLOCKS_PRIVATE_KEY,
    'base64'
  ).toString('utf-8')
}

module.exports = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  unlockEnv,
  wedlocksPrivateKey,
  sender:
    process.env.SMTP_FROM_ADDRESS || 'Unlock <no-reply@unlock-protocol.com>', // TODO: can we do better eventually?
}
