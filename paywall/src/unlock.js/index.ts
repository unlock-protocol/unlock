import startup from './startup'
import '../paywall-builder/iframe.css'
import { UnlockWindow } from '../windowTypes'
import StartupConstants from './startupTypes'

declare const process: {
  env: {
    UNLOCK_ENV: 'dev' | 'test' | 'staging' | 'prod'
  }
}

const constants: { [key: string]: StartupConstants } = {
  dev: {
    network: 1984,
  },
  test: {
    network: 1984,
  },
  staging: {
    network: 4,
  },
  prod: {
    network: 1,
  },
}

let started = false
if (document.readyState !== 'loading') {
  // in most cases, we will start up after the document is interactive
  // so listening for the DOMContentLoaded or load events is superfluous
  startup(
    (window as unknown) as UnlockWindow,
    constants[process.env.UNLOCK_ENV]
  )
  started = true
} else {
  const begin = () => {
    if (!started)
      startup(
        (window as unknown) as UnlockWindow,
        constants[process.env.UNLOCK_ENV]
      )
    started = true
  }
  // if we reach here, the page is sitll loading
  window.addEventListener('DOMContentLoaded', begin)
  window.addEventListener('load', begin)
}
