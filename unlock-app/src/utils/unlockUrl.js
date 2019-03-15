import {
  CANONICAL_BASE_STAGING_URL,
  CANONICAL_BASE_DEV_URL,
  CANONICAL_BASE_URL,
} from '../constants'

const unlockUrl = (env, config) => {
  if (env && env.UNLOCK_URL) return env.UNLOCK_URL

  let unlockEnv
  if (config && config.unlockEnv) unlockEnv = config.unlockEnv

  switch (unlockEnv) {
    case 'staging':
      return CANONICAL_BASE_STAGING_URL
    case 'prod':
      return CANONICAL_BASE_URL
    case 'dev':
    default:
      return CANONICAL_BASE_DEV_URL
  }
}

module.exports = {
  unlockUrl,
}
