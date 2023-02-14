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
  // eslint-disable-next-line no-console
  console.log(`Loading config from ${configPath}`)
}

try {
  dotenv.config({
    path: configPath,
  })
} catch (error) {
  console.error('Failed to load config', error)
}
