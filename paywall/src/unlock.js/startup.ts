import { makeIframe, addIframeToDocument } from './iframeManager'
import setupPostOffices, { normalizeConfig } from './setupPostOffices'
import { UnlockWindow } from '../windowTypes'

export default function startup(window: UnlockWindow) {
  // Get the config
  const normalizedConfig = normalizeConfig(window.unlockProtocolConfig)

  const origin = '?origin=' + encodeURIComponent(window.origin)

  const dataIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/static/data-iframe.1.0.html' + origin,
    'unlock data'
  )
  const checkoutIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/checkout' + origin,
    'unlock checkout'
  )
  // TODO: We should not load the iframe for user account is the configuration does not mention it
  const userAccountsIframe = makeIframe(
    window,
    process.env.USER_IFRAME_URL + origin,
    'unlock accounts'
  )
  addIframeToDocument(window, dataIframe)
  addIframeToDocument(window, userAccountsIframe)
  addIframeToDocument(window, checkoutIframe)

  setupPostOffices(
    normalizedConfig,
    window,
    dataIframe,
    checkoutIframe,
    userAccountsIframe
  )
}
