import { UnlockWindowNoProtocolYet } from '../windowTypes'
import IframeHandler from './IframeHandler'
import Wallet from './Wallet'
import MainWindowHandler from './MainWindowHandler'
import CheckoutUIHandler from './CheckoutUIHandler'
import StartupConstants from './startupTypes'

/**
 * convert all of the lock addresses to lower-case so they are normalized across the app
 */
export function normalizeConfig(unlockConfig: any) {
  if (
    !unlockConfig ||
    !unlockConfig.locks ||
    typeof unlockConfig.locks !== 'object'
  )
    return unlockConfig
  const lockAddresses = Object.keys(unlockConfig.locks)
  if (!lockAddresses.length) {
    return unlockConfig
  }
  const normalizedConfig = {
    ...unlockConfig,
    locks: lockAddresses.reduce((allLocks, address) => {
      return {
        ...allLocks,
        [address.toLowerCase()]: unlockConfig.locks[address],
      }
    }, {}),
  }
  return normalizedConfig
}

/**
 * Start the unlock app!
 */
export function startup(
  window: UnlockWindowNoProtocolYet,
  constants: StartupConstants
) {
  // normalize all of the lock addresses
  const config = normalizeConfig(window.unlockProtocolConfig)
  // this next line ensures that the minimally valid configuration is passed to Wallet
  // TODO: provide some kind of developer mode which lazy-loads more extensive validation
  if (!config) {
    throw new Error(
      'Invalid configuration, please set window.unlockProtocolConfig'
    )
  }

  const origin = '?origin=' + encodeURIComponent(window.origin)
  // construct the 3 urls for the iframes
  const dataIframeUrl =
    constants.paywallUrl + '/static/data-iframe.1.0.html' + origin
  const checkoutIframeUrl = constants.paywallUrl + '/checkout' + origin
  const userIframeUrl = constants.accountsUrl + origin

  // create the iframes (the user accounts iframe is a dummy unless enabled in Wallet.setupWallet())
  const iframes = new IframeHandler(
    window,
    dataIframeUrl,
    checkoutIframeUrl,
    userIframeUrl
  )
  iframes.init(config)

  // set up the communication with the checkout iframe
  const checkoutIframeHandler = new CheckoutUIHandler(iframes, config)
  // user accounts is loaded on-demand inside of Wallet
  // set up the proxy wallet handler
  // the config must not be falsy here, so the checking "config.unlockUserAccounts" does not throw a TyoeError
  const wallet = new Wallet(window, iframes, config, constants)
  // set up the main window handler, for both events and hiding/showing iframes
  const mainWindow = new MainWindowHandler(window, iframes)

  // go!
  mainWindow.init()
  wallet.init()
  checkoutIframeHandler.init({
    usingManagedAccount: wallet.useUserAccounts,
  })
  return iframes // this is only useful in testing, it is ignored in the app
}

// Make sure the page is ready before we try to start the app!
export default function startupWhenReady(
  window: Window,
  startupConstants: StartupConstants
) {
  let started = false
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
    // if we reach here, the page is still loading
    window.addEventListener('DOMContentLoaded', begin)
    window.addEventListener('load', begin)
  }
}
