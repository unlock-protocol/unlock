import { makeIframe, addIframeToDocument } from './iframeManager'
import setupPostOffices, { normalizeConfig } from './setupPostOffices'
import dispatchEvent from './dispatchEvent'
import { UnlockWindow } from '../windowTypes'

export default function startup(window: UnlockWindow) {
  // this is a cache for the time between script startup and the full load
  // of the data iframe. The data iframe will then send down the current
  // value, overriding this. A bit later, the blockchain handler will update
  // with the actual value, so this is only used for a few milliseconds
  let locked
  try {
    locked = JSON.parse(
      window.localStorage.getItem('__unlockProtocol.locked') || '"ignore"'
    )
  } catch (_) {
    locked = 'ignore'
  }
  if (locked === true) {
    dispatchEvent(window, 'locked')
  }
  if (locked === false) {
    dispatchEvent(window, 'unlocked')
  }

  // Get the config
  const normalizedConfig = normalizeConfig(window.unlockProtocolConfig)

  const origin = '?origin=' + encodeURIComponent(window.origin)

  // Loading the data iframe
  const dataIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/static/data-iframe.1.0.html' + origin
  )
  addIframeToDocument(window, dataIframe)

  // Loading the checkout iframe
  const checkoutIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/checkout' + origin
  )
  addIframeToDocument(window, checkoutIframe)

  // Loading the user account iframe (if applicable)
  let userAccountsIframe
  if (normalizedConfig.unlockUserAccounts) {
    userAccountsIframe = makeIframe(
      window,
      process.env.USER_IFRAME_URL + origin
    )
  } else {
    userAccountsIframe = makeIframe(
      window,
      '' // We make an "empty" accounts iframe
    )
  }
  addIframeToDocument(window, userAccountsIframe)

  setupPostOffices(
    normalizedConfig,
    window,
    dataIframe,
    checkoutIframe,
    userAccountsIframe
  )
}
