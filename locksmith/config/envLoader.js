const path = require('path')
const dotenv = require('dotenv')

const unlockEnv = process.env.UNLOCK_ENV || 'dev'

const configPath = path.resolve(
  __dirname,
  '..', //
  '..',
  `.env.${unlockEnv}.local`
)

if (process.env.NODE_ENV !== 'test') {
  console.log(`Loading config from ${configPath}`)
}

try {
  console.log(configPath)

  dotenv.config({
    path: configPath,
  })
} catch (error) {
  console.error('Failed to load config', error)
}
