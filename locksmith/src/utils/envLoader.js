const path = require('path')
const dotenv = require('dotenv')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

const configPath = path.resolve(
  __dirname,
  '..', //
  '..',
  '..',
  `.env.${unlockEnv}.local`
)
console.log(`Loading config from ${configPath}`)

dotenv.config({
  path: configPath,
})
