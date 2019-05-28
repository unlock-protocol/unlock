import { getIframe, add, show, hide } from './iframe'
import { findPaywallUrl } from './script'
import {
  POST_MESSAGE_LOCKED,
  POST_MESSAGE_UNLOCKED,
  POST_MESSAGE_REDIRECT,
  POST_MESSAGE_GET_OPTIMISTIC,
  POST_MESSAGE_GET_PESSIMISTIC,
} from './constants'
import { disableScrollPolling, enableScrollPolling, scrollLoop } from './scroll'
import { setupReadyListener } from './config'

export function redirect(window, paywallUrl) {
  // we use window.encodeURIComponent here to make testing
  // for resilience to errors easier
  const redirectTo = window.encodeURIComponent(window.location.href)

  window.location.href = paywallUrl + redirectTo
}

export default function buildPaywall(window, document, lockAddress, blocker) {
  // If there is no lock, do nothing!
  if (!lockAddress) {
    return
  }

  try {
    // in the paywall, postMessage needs to know the origin of the parent window
    // This allows us to securely pass it in
    const originUrl = `?origin=${encodeURIComponent(window.origin)}`
    const paywallUrl =
      findPaywallUrl(document) + `/${lockAddress}/` + window.location.hash
    const paywallUrlWithOrigin =
      findPaywallUrl(document) +
      `/${lockAddress}/${originUrl}` +
      window.location.hash
    const iframe = getIframe(document, paywallUrlWithOrigin)
    const origin = new window.URL(paywallUrl).origin

    // If the user removes the iframe, make sure we add it back!
    // TODO: consider performance/battery impact
    setInterval(() => {
      add(document, iframe)
    }, 500)

    add(document, iframe)
    setupReadyListener(window, iframe, origin)

    let locked = false

    window.addEventListener(
      'message',
      event => {
        try {
          if (
            event.origin !== origin ||
            event.source !== iframe.contentWindow
          ) {
            // nice try, hackers
            return
          }
          if (event.data === POST_MESSAGE_LOCKED && !locked) {
            locked = true
            enableScrollPolling()

            scrollLoop(window, document, iframe, origin)
            show(iframe, document)
            blocker.remove()
          }
          if (event.data === POST_MESSAGE_GET_OPTIMISTIC && locked) {
            disableScrollPolling()

            hide(iframe, document, false)
          }
          if (event.data === POST_MESSAGE_GET_PESSIMISTIC && locked) {
            enableScrollPolling()

            scrollLoop(window, document, iframe, origin)
            show(iframe, document)
          }
          if (event.data === POST_MESSAGE_UNLOCKED && locked) {
            locked = false
            disableScrollPolling()

            hide(iframe, document)
            blocker.remove()
          }
          if (event.data === POST_MESSAGE_REDIRECT) {
            redirect(window, paywallUrl)
          }
        } catch (e) {
          iframe.remove()
          blocker.remove()
          throw e
        }
      },
      false
    )
  } catch (e) {
    blocker.remove()
    throw e
  }
}
