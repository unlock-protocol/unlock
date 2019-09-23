import StartupConstants from './startupTypes'

// Typechecking fails in CI (but not locally) unless we assert that process.env
// will always be set to one of these values
declare const process: {
  env: {
    UNLOCK_ENV: 'dev' | 'test' | 'staging' | 'prod'
    DEBUG: any
    PAYWALL_URL: string
    USER_IFRAME_URL: string
  }
}

const constants: { [key: string]: StartupConstants } = {
  dev: {
    network: 1984,
    debug: process.env.DEBUG,
    paywallUrl: process.env.PAYWALL_URL || 'http://localhost:3001',
    accountsUrl: process.env.USER_IFRAME_URL || 'http://localhost:3000/account',
  },
  test: {
    network: 1984,
    debug: process.env.DEBUG,
    paywallUrl: process.env.PAYWALL_URL || 'http://localhost:3001',
    accountsUrl: process.env.USER_IFRAME_URL || 'http://localhost:3000/account',
  },
  staging: {
    network: 4,
    debug: process.env.DEBUG,
    paywallUrl: process.env.PAYWALL_URL,
    accountsUrl: process.env.USER_IFRAME_URL,
  },
  prod: {
    network: 1,
    debug: process.env.DEBUG,
    paywallUrl: process.env.PAYWALL_URL,
    accountsUrl: process.env.USER_IFRAME_URL,
  },
}

export default constants
