/* eslint no-console: 0 */
// This needs to be written as ES5 because it is consumed by Webpack too to assess the config
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredVariables = ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD']
requiredVariables.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Environment variable ${envVar} is required.`)
    if (['dev', 'test'].indexOf(unlockEnv) === -1) {
      process.exit(1)
    }
  }
})

module.exports = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  unlockEnv,
  sender:
    process.env.SMTP_FROM_ADDRESS || 'Unlock <no-reply@unlock-protocol.com>', // TODO: can we do better eventually?
}
