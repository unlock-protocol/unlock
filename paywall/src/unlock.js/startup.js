import { makeIframe, addIframeToDocument } from './iframeManager'
import setupPostOffices from './setupPostOffices'
import dispatchEvent from './dispatchEvent'

export default function startup(window) {
  try {
    // this is a cache for the time between script startup and the full load
    // of the data iframe. The data iframe will then send down the current
    // value, overriding this. A bit later, the blockchain handler will update
    // with the actual value, so this is only used for a few milliseconds
    const locked = JSON.parse(
      window.localStorage.getItem('__unlockProtocol.locked')
    )
    if (locked === true) {
      dispatchEvent(window, 'locked')
    }
    if (locked === false) {
      dispatchEvent(window, 'unlocked')
    }
  } catch (e) {
    // ignore
  }

  const origin = '?origin=' + encodeURIComponent(window.origin)

  const dataIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/static/data-iframe.1.0.html' + origin
  )
  addIframeToDocument(window, dataIframe)
  const checkoutIframe = makeIframe(
    window,
    process.env.PAYWALL_URL + '/checkout' + origin
  )
  addIframeToDocument(window, checkoutIframe)
  const userAccountsIframe = makeIframe(
    window,
    process.env.USER_IFRAME_URL + '/account' + origin
  )
  addIframeToDocument(window, userAccountsIframe)

  setupPostOffices(window, dataIframe, checkoutIframe)
}
