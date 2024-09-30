type Config = Record<
  'gaId' | 'gaTmId' | 'baseURL' | 'appURL' | 'gApiKey',
  string
>

const devConfig: Config = {
  gaId: '',
  gaTmId: '',
  baseURL:
    process.env.NEXT_PUBLIC_URL_BASE ?? 'https://staging.unlock-protocol.com',
  appURL:
    process.env.NEXT_PUBLIC_UNLOCK_APP_URI ??
    'https://staging-app.unlock-protocol.com',
  gApiKey: 'AIzaSyBg3KvAA34I6CRGA7YkhjbkKPcMgfJVzas',
}

const stagingConfig: Config = {
  gaId: '',
  gaTmId: '',
  baseURL: 'https://staging.unlock-protocol.com',
  appURL: 'https://staging-app.unlock-protocol.com',
  gApiKey: 'AIzaSyBg3KvAA34I6CRGA7YkhjbkKPcMgfJVzas',
}

const productionConfig: Config = {
  gaId: 'UA-142114767-1',
  gaTmId: 'GTM-ND2KDWB',
  baseURL: 'https://unlock-protocol.com',
  appURL: 'https://app.unlock-protocol.com',
  gApiKey: 'AIzaSyBg3KvAA34I6CRGA7YkhjbkKPcMgfJVzas',
}

function getUnlockConfig(environment?: string) {
  switch (environment) {
    case 'prod':
      return productionConfig
    case 'staging':
      return stagingConfig
    default:
      return devConfig
  }
}

export const unlockConfig = getUnlockConfig('prod')
