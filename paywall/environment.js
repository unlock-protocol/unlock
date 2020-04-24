/* eslint no-console: 0 */
const dotenv = require('dotenv')
const path = require('path')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

dotenv.config({
  path: path.resolve(__dirname, '..', `.env.${unlockEnv}.local`),
})

const requiredConfigVariables = {
  unlockEnv,
  unlockAppUrl: process.env.UNLOCK_APP_URL,
  readOnlyProvider: process.env.READ_ONLY_PROVIDER,
  locksmithUri: process.env.LOCKSMITH_URI,
}

const optionalConfigVariables = {
  httpProvider: process.env.HTTP_PROVIDER,
}

Object.keys(requiredConfigVariables).forEach(configVariableName => {
  if (!requiredConfigVariables[configVariableName]) {
    if (['dev', 'test'].indexOf(requiredConfigVariables.unlockEnv) > -1) {
      return console.error(
        `The configuration variable ${configVariableName} is falsy.`
      )
    }
    throw new Error(
      `The configuration variable ${configVariableName} is falsy.`
    )
  }
})

module.exports = {
  ...requiredConfigVariables,
  ...optionalConfigVariables,
}
