/* eslint no-console: 0 */
// This needs to be written as ES5 because it is consumed by Webpack too to assess the config
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

// Remember to add mapping in webpack for all environment variables below
const requiredVariables = ['SMTP_HOST', 'SMTP_USERNAME', 'SMTP_PASSWORD']
requiredVariables.forEach((envVar) => {
  if (!process.env[envVar]) {
    if (['test'].indexOf(unlockEnv) === -1) {
      console.error(`Environment variable ${envVar} is required.`)
    }
    if (['dev', 'test'].indexOf(unlockEnv) === -1) {
      process.exit(1)
    }
  }
})

console.log(
  `module.exports = ${JSON.stringify({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    credentials: {
      username: process.env.SMTP_USERNAME,
      password: process.env.SMTP_PASSWORD,
    },
    authType: 'plain',

    unlockEnv,
    sender: process.env.SMTP_FROM_ADDRESS || 'hello@unlock-protocol.com',
  })}`
)
