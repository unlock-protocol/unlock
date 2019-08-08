import { UnlockWindow } from '../windowTypes'
import IframeHandler from './IframeHandler'
import Wallet from './Wallet'
import MainWindowHandler from './MainWindowHandler'
import CheckoutUIHandler from './CheckoutUIHandler'

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

export interface StartupConstants {
  network: 1 | 4 | 1984
}

/**
 * Start the unlock app!
 */
export default function startup(
  window: UnlockWindow,
  constants: StartupConstants
) {
  // normalize all of the lock addresses
  const config = normalizeConfig(window.unlockProtocolConfig)

  const origin = '?origin=' + encodeURIComponent(window.origin)
  // construct the 3 urls for the iframes
  const dataIframeUrl =
    process.env.PAYWALL_URL + '/static/data-iframe.1.0.html' + origin
  const checkoutIframeUrl = process.env.PAYWALL_URL + '/checkout' + origin
  const userIframeUrl = process.env.USER_IFRAME_URL + origin

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
  const wallet = new Wallet(window, iframes, config, constants)
  // set up the main window handler, for both events and hiding/showing iframes
  const mainWindow = new MainWindowHandler(window, iframes, config)

  // go!
  mainWindow.init()
  wallet.init()
  checkoutIframeHandler.init()
}
