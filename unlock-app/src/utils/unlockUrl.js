const unlockUrl = (env, config) => {
  if (env && env.UNLOCK_URL) return env.UNLOCK_URL

  let unlockEnv
  if (config && config.unlockEnv) unlockEnv = config.unlockEnv

  switch (unlockEnv) {
    case 'staging':
      return 'https://staging.unlock-protocol.com'
    case 'prod':
      return 'https://unlock-protocol.com'
    case 'dev':
    default:
      return 'http://localhost:3000'
  }
}

module.exports = {
  unlockUrl,
}
