import startup from './startup'
import '../static/iframe.css'
import { UnlockWindowNoProtocolYet } from '../windowTypes'
import StartupConstants from './startupTypes'

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

// TODO: make this more sophisticated? Would be nice to be able to pass config
// as a param instead of relying on a window variable. For now this is just a
// slight modification of `index.ts`
export function init() {
  let started = false
  const startupConstants = constants[process.env.UNLOCK_ENV]
  if (document.readyState !== 'loading') {
    // in most cases, we will start up after the document is interactive
    // so listening for the DOMContentLoaded or load events is superfluous
    startup((window as unknown) as UnlockWindowNoProtocolYet, startupConstants)
    started = true
  } else {
    const begin = () => {
      if (!started)
        startup(
          (window as unknown) as UnlockWindowNoProtocolYet,
          startupConstants
        )
      started = true
    }
    // if we reach here, the page is sitll loading
    window.addEventListener('DOMContentLoaded', begin)
    window.addEventListener('load', begin)
  }
}

export default init
